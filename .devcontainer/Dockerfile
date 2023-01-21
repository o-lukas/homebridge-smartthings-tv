FROM mcr.microsoft.com/devcontainers/javascript-node:0-18-bullseye

# Install homebridge
RUN npm install -g --unsafe-perm homebridge homebridge-config-ui-x

# Copy the default homebridge config
RUN mkdir /home/node/.homebridge \
    && chown node /home/node/.homebridge
COPY homebridge-config.json /home/node/.homebridge/config.json