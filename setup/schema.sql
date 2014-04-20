
DROP TABLE IF EXISTS
crypts,
solutions;

CREATE TABLE frequenciesSingle (
	
	crypt CHAR(16) NOT NULL UNIQUE,
	frequency INT NOT NULL DEFAULT 0
);

CREATE TABLE frequenciesDouble (
	
	first CHAR(16) NOT NULL,
	second CHAR(16) NOT NULL,
	frequency INT NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX ON frequenciesDouble (first, second);

CREATE TABLE solutions (

	crypt CHAR(16) NOT NULL UNIQUE,
	plain CHAR(8) NOT NULL
);
CREATE INDEX ON solutions (plain);
