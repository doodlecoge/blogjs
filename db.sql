DROP DATABASE IF EXISTS blogjs;

CREATE DATABASE blogjs;

GRANT ALL PRIVILEGES ON blogjs.*
TO 'huaichao'@'%'
IDENTIFIED BY 'password';

FLUSH PRIVILEGES;

USE blogjs;

CREATE TABLE users
(
  username   VARCHAR(20) NOT NULL PRIMARY KEY,
  password   VARCHAR(20) NOT NULL,
  fullname   VARCHAR(20) NOT NULL,
  created_at TIMESTAMP   NOT NULL
);

INSERT INTO users
(username, password, fullname, created_at)
VALUES
  ('huaichao', 'pass1234', 'Huaichao Wang', '2014-11-29'),
  ('chaochao', 'pass1234', 'Huaichao Wang', '2014-11-29');

CREATE TABLE tags
(
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO tags (id, name)
VALUES
  (1, 'hibernate'),
  (2, 'java'),
  (3, 'javascript'),
  (4, 'c/c++'),
  (5, 'spring'),
  (6, 'struts'),
  (7, 'vb'),
  (8, 'c#'),
  (9, 'python');

CREATE TABLE articles
(
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200)  NOT NULL,
  content    VARCHAR(4096) NOT NULL,
  username   VARCHAR(20)   NOT NULL,
  created_at DATETIME      NOT NULL,
  updated_at DATETIME      NOT NULL,
  FOREIGN KEY (username) REFERENCES users (username)
);

INSERT INTO articles
(id, title, content, username, created_at, updated_at)
VALUES
  (1, 'spring security', '', 'huaichao', '2014-11-29', '2014-11-29'),
  (2, 'c/c++          ', '', 'huaichao', '2014-11-29', '2014-11-29'),
  (3, 'sed command    ', '', 'huaichao', '2014-11-29', '2014-11-29'),
  (4, 'java reflection', '', 'huaichao', '2014-11-29', '2014-11-29'),
  (5, 'python network ', '', 'huaichao', '2014-11-29', '2014-11-29');

CREATE TABLE articles_tags
(
  aid INT NOT NULL,
  tid INT NOT NULL,
  PRIMARY KEY (aid, tid),
  FOREIGN KEY (aid) REFERENCES articles (id),
  FOREIGN KEY (tid) REFERENCES tags (id)
);

INSERT INTO articles_tags
(aid, tid)
VALUES
  (1, 1),
  (1, 2),
  (1, 6),
  (2, 1),
  (2, 5),
  (2, 6),
  (2, 9);
