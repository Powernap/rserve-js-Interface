![](http://cl.ly/image/4515302S2a1Y/RServe%20Interface.png "Image")

# This is a Proof of Concept Project
This is a proof of concept project, not all RServe Functions are accessible.

# How it Works
The JavaScript implementation of RServe is done through [rserve-js](https://github.com/cscheid/rserve-js). The Repository is cloned into the lib directory when running `make install`.

To run it, you first have to start the node server through `node server`.

By Connecting to `http://localhost:8082/`, all RServ connections will be killed and a new one will be started through node.

Now you can evaluate Terms via the Interface.


# Installation
1. Install [R](http://www.r-project.org/)
2. Install [Rserv](http://www.rforge.net/Rserve/index.html)
3. Run `make install` to clone required repositories and NPM Modules
4. If everything is installed correctly, running `make test` should yield in the following messages: `INIT! UP! DOWN!`