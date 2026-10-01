FROM eclipse-temurin:21-jre
WORKDIR /app
COPY build/libs/config-server-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]