FROM mariadb:latest

ENV MYSQL_DATABASE db
ENV MYSQL_USER user
ENV MYSQL_PASSWORD password
ENV MYSQL_ROOT_PASSWORD root_password

RUN apt-get update && apt-get -y install vim

EXPOSE 3306

CMD ["mysqld"]