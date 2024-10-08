# This command is used to download a reference Image
FROM node:18

# copy everything from the base folder of the machine
# to the base folder of the container
COPY ./ ./

# install the dependencies
RUN npm install

EXPOSE 4000

# The default command
CMD ["node","app.js"]
