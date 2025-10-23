FROM mcr.microsoft.com/devcontainers/javascript-node:24-bullseye

# Install homebridge
RUN npm install -g --unsafe-perm homebridge homebridge-config-ui-x

# Enable usage of ping command
RUN apt-get update
RUN apt-get install iputils-ping

# Install python3 and pip and pre-commit
RUN apt-get install python3 python3-pip -y
RUN pip install pre-commit
RUN pip install commitizen
