FROM mcr.microsoft.com/devcontainers/javascript-node:20-bullseye

# Install homebridge
RUN npm install -g --unsafe-perm homebridge homebridge-config-ui-x

# Copy the default homebridge config
RUN mkdir /home/node/.homebridge \
    && chown node /home/node/.homebridge
COPY homebridge-config/config.json /home/node/.homebridge/config.json
COPY homebridge-config/auth.json /home/node/.homebridge/auth.json

# Enable usage of ping command
RUN apt-get update
RUN apt-get install iputils-ping

# Install python3 and pip and pre-commit
RUN apt-get install python3 python3-pip -y
RUN pip install pre-commit
