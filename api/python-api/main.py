import os
import time
import psycopg2
import base64
import random
import pandas as pd
from sqlalchemy import create_engine
from google.cloud import secretmanager
from google.cloud import pubsub_v1
from google.cloud import storage
from google.cloud import tasks_v2
import json
from datetime import datetime
import gcsfs

PROJECT_ID = '<PROJECT_ID>'

HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': True,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
}

fs = gcsfs.GCSFileSystem()
fs.invalidate_cache()


def generate(random_chars: int = 10, alphabet: str = "0123456789abcdef") -> str:
  r = random.SystemRandom()
  return ''.join([r.choice(alphabet) for _ in range(random_chars)])


def cors_handler(request):
  if request.method == 'OPTIONS':
    headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Access-Control-Max-Age': '3600',
      'Access-Control-Allow-Credentials': 'true'
    }
    return ('', 204, headers)
  headers = {
    'Access-Control-Allow-Origin': '*'
  }

  return ('Hello World!', 200, headers)


def get_secret(project_id: str, secret_id: str):
  client = secretmanager.SecretManagerServiceClient()
  name = client.secret_version_path(project_id, secret_id, 'latest')
  response = client.access_secret_version(request={"name": name})
  payload = response.payload.data.decode("UTF-8")
  return payload


def get_conn(secret):
  conn = psycopg2.connect(
    dbname='<DB_NAME>',
    user='<DB_USER>',
    password=secret,
    port=5432,
    host='<DB_IP>'
  )
  conn.autocommit = True
  return conn


secret = get_secret(PROJECT_ID, 'db-password')


def test_connection(request):
  conn = get_conn(secret)
  headers = {**HEADERS, **{
    "Content-Type": "text/html"
  }}
  if conn:
    return ("<html><body><p>Connection Successful</p></body></html>", 200, headers)
  else:
    return ("<html><body><p>Could not establish connection</p></body></html>", 500, headers)


def handle_error(error):
  print(error)
  headers = {**HEADERS, **{
    "Content-Type": "application/json"
  }}
  res = {"response": str(error)}
  return (res, 500, headers)


def hello(request):
  # html endpoint
  try:
    time = datetime.now()
    time_str = str(time)
    headers = {**HEADERS, **{
      "Content-Type": "text/html"
    }}
    return (
      "<html><body><p>Hello World! It is now {0}.</p></br><p>Request:{1}</p></body></html>".format(time_str, request),
      200, headers)
  except Exception as e:
    return handle_error(e)



def get_all_table_data(request):
  conn = get_conn(secret)
  # request should be an object and include a `table_name` field
  request_json = request.get_json(silent=True)
  request_args = request.args
  table_name = None
  if request_json and 'table_name' in request_json:
    table_name = request_json['table_name']
  elif request_args and 'table_name' in request_args:
    table_name = request_args['table_name']

  cur = conn.cursor()
  query = f'SELECT * FROM {table_name}'
  try:
    cur.execute(query)
    colnames = [desc[0] for desc in cur.description]
    results = cur.fetchall()
    df = pd.DataFrame(results, columns=colnames)
    json_data = df.to_json(orient='records')
    headers = {**HEADERS, **{
      "Content-Type": "application/json"
    }
               }
    return (f"{json_data}", 200, headers)
  except Exception as e:
    return handle_error(e)


def generic_select_query(request):
  conn = get_conn(secret)

  # request should be an object and include a `table_name` field and a `columns` field which should be a list of column names
  request_json = request.get_json(silent=True)
  request_args = request.args
  table_name, columns = None, None
  if request_json and 'table_name' in request_json and 'columns' in request_json:
    table_name, columns = request_json['table_name'], request_json['columns']
  elif request_args and 'table_name' in request_args and 'columns' in request_args:
    table_name, columns = request_args['table_name'], request_args['columns']

  columns = ', '.join([str(_) for _ in columns])

  query = f'SELECT {columns} FROM {table_name};'

  cur = conn.cursor()
  try:
    cur.execute(query)
    results = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    df = pd.DataFrame(results, columns=colnames)
    json_data = df.to_json(orient='records')
    headers = {**HEADERS, **{
      "Content-Type": "application/json"
    }
               }
    return (f"{json_data}", 200, headers)
  except Exception as e:
    return handle_error(e)


def generic_select_where_query(request):
  conn = get_conn(secret)

  # request should be an object and include a `table_name` field and a `project_id` field
  request_json = request.get_json(silent=True)
  request_args = request.args
  table_name, project_id, columns = None, None, None
  if request_json and 'table_name' in request_json and 'project_id' in request_json:
    table_name, project_id = request_json['table_name'], request_json['project_id']
    if request_json['columns']:
      columns = request_json['columns']
  elif request_args and 'table_name' in request_args and 'project_id' in request_args:
    table_name, project_id = request_args['table_name'], request_args['project_id']
    if request_args['columns']:
      columns = request_args['columns']

  if columns:
    columns = ', '.join([str(_) for _ in columns])
    query = f"SELECT {columns} FROM {table_name} WHERE project_id='{project_id}';"
  else:
    query = f"SELECT * FROM {table_name} WHERE project_id='{project_id}';"

  cur = conn.cursor()
  try:
    cur.execute(query)
    results = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    df = pd.DataFrame(results, columns=colnames)
    json_data = df.to_json(orient='records')
    headers = {**HEADERS, **{
      "Content-Type": "application/json"
    }
               }
    return (f"{json_data}", 200, headers)
  except Exception as e:
    return handle_error(e)


def query(request):
  # request should include a `query_string` field which is a string of a valid SQL query
  request_json = request.get_json(silent=True)
  request_args = request.args
  if request_json and 'query_string' in request_json:
    query_string = request_json['query_string']
  elif request_args and 'query_string' in request_args:
    query_string = request_args['query_string']
  conn = get_conn(secret)
  cur = conn.cursor()
  try:
    cur.execute(query_string)
    results = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    df = pd.DataFrame(results, columns=colnames)
    json_data = df.to_json(orient='records')
    headers = {**HEADERS, **{
      "Content-Type": "application/json"
    }
               }
    return (f"{json_data}", 200, headers)
  except Exception as e:
    return handle_error(e)


def list_tables(request):
  conn = get_conn(secret)
  cur = conn.cursor()
  try:
    cur.execute(
      "SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';")
    results = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    drop_cols = list(set(colnames) - set(['tablename']))
    df = pd.DataFrame(results, columns=colnames)
    df.drop(drop_cols, axis=1, inplace=True)
    res = df.values.tolist()
    res = [_[0] for _ in res]
    json_data = {"tables": res}
    json_data = json.dumps(json_data)
    headers = {**HEADERS, **{
      "Content-Type": "application/json"
    }
               }
    return (f"{json_data}", 200, headers)
  except Exception as e:
    return handle_error(e)


def get_table_schema(request):
  request_json = request.get_json(silent=True)
  request_args = request.args
  table_name = None
  if request_json and 'table_name' in request_json:
    table_name = request_json['table_name']
  elif request_args and 'table_name' in request_args:
    table_name = request_args['table_name']

  try:
    conn = get_conn(secret)
    cur = conn.cursor()
    cur.execute(f"SELECT column_name FROM information_schema.columns WHERE TABLE_NAME = '{table_name}';")
    results = cur.fetchall()
    results = [_[0] for _ in results]
    json_data = {"columns": results}
    json_data = json.dumps(json_data)
    headers = {**HEADERS, **{
      "Content-Type": "application/json"
    }
               }
    return (f"{json_data}", 200, headers)
  except Exception as e:
    return handle_error(e)


def get_projects(request):
  conn = get_conn(secret)

  query = f"SELECT * FROM projects;"

  cur = conn.cursor()
  try:
    cur.execute(query)
    results = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    df = pd.DataFrame(results, columns=colnames)
    json_data = df.to_json(orient='records')
    headers = {**HEADERS, **{
      "Content-Type": "application/json"
    }
               }
    return (f"{json_data}", 200, headers)
  except Exception as e:
    return handle_error(e)



def list_gcloud_files(request) -> list:
  request_json = request.get_json(silent=True)
  request_args = request.args
  bucket_id = None
  if request_json and 'bucket_id' in request_json:
    bucket_id = request_json['bucket_id']
  elif request_args and 'bucket_id' in request_args:
    bucket_id = request_args['bucket_id']
  client = storage.Client()
  bucket = client.get_bucket(bucket_id)
  all_blobs = list(client.list_blobs(bucket))
  return all_blobs


def download_gcloud_file(bucket_id: str, directory: str, filename: str):
  client = storage.Client()
  bucket = client.get_bucket(bucket_id)
  blob = storage.Blob(directory + filename, bucket)
  with open(filename, 'wb') as f:
    blob.download_to_file(f)


def read_gcloud_data(bucket_id: str, file_name: str) -> pd.DataFrame:
  gcloud_path = f"gs://{bucket_id}/{file_name}"
  if '.csv' in file_name:
    df = pd.read_csv(gcloud_path)
  elif '.xlsx' in file_name:
    df = pd.read_excel(gcloud_path)
  elif '.json' in file_name:
    df = pd.read_json(gcloud_path)
  else:
    return pd.DataFrame()
  return df


def clear_temp_storage(file_name: str):
  os.remove(file_name)


def upload_gcloud_file(bucket_id: str, path: str, filename: str, destination_path: str, destination_filename: str,
                       metadata: dict = {}):
  # profiles need in metadata project_id, profile_id, program_type, design_level
  # results need in metadata project_id, profile_id
  client = storage.Client()
  bucket = client.get_bucket(bucket_id)
  blob = bucket.blob(destination_path + destination_filename)

  blob.upload_from_filename(path + filename)
  blob.metadata = metadata
  blob.patch()

  print("File {} uploaded to {}.".format(path + filename, destination_path + destination_filename))


def gcs_storage_logging(event, context):
  """Background Cloud Function to be triggered by Cloud Storage.
     This generic function logs relevant data when a file is changed.

  Args:
      event (dict):  The dictionary with data specific to this type of event.
                     The `data` field contains a description of the event in
                     the Cloud Storage `object` format described here:
                     https://cloud.google.com/storage/docs/json_api/v1/objects#resource
      context (google.cloud.functions.Context): Metadata of triggering event.
  Returns:
      None; the output is written to Stackdriver Logging
  """
  print('Event ID: {}'.format(context.event_id))
  print('Event type: {}'.format(context.event_type))
  print('Bucket: {}'.format(event['bucket']))
  print('File: {}'.format(event['name']))
  print('Metageneration: {}'.format(event['metageneration']))
  print('Created: {}'.format(event['timeCreated']))
  print('Updated: {}'.format(event['updated']))
  if event['kind'] == 'storage#object':
    blob_metadata(event['bucket'], event['name'])


def blob_metadata(bucket_name: str, blob_name: str):
  storage_client = storage.Client()
  bucket = storage_client.bucket(bucket_name)

  blob = bucket.get_blob(blob_name)

  print("Blob: {}".format(blob.name))
  print("Metadata: {}".format(blob.metadata))
  return blob.metadata

if __name__ == "__main__":
  start = time.perf_counter()

  end = time.perf_counter()
  print(end - start)
