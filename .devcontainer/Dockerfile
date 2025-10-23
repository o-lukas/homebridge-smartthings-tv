FROM mcr.microsoft.com/devcontainers/javascript-node:24-bullseye

# Install homebridge
RUN curl -sSfL https://repo.homebridge.io/KEY.gpg | sudo gpg --dearmor | sudo tee /usr/share/keyrings/homebridge.gpg  > /dev/null
RUN echo "deb [signed-by=/usr/share/keyrings/homebridge.gpg] https://repo.homebridge.io stable main" | sudo tee /etc/apt/sources.list.d/homebridge.list > /dev/null
RUN apt-get update
RUN apt-get install homebridge -y

# Enable usage of ping command
RUN apt-get install iputils-ping -y

# Install python3 and pip and pre-commit
RUN apt-get install python3 python3-pip -y
RUN pip install pre-commit
RUN pip install commitizen
