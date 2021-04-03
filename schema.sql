-- run in trminal psql -d <data name> -f <file name>
DROP TABLE IF EXISTS cityTable;
CREATE TABLE IF NOT EXISTS
cityTable(
    id SERIAL NOT NULL,
    search_query VARCHAR(256) ,
    formatted_query VARCHAR(256),
    latitude FLOAT(24),
    longitude FLOAT(24)
);