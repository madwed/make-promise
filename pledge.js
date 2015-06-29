/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

function $Promise(){
	this.state = "pending";
	this.handlerGroups = [];
}

$Promise.prototype.then = function(resolve, reject){
	var handlers = {
			successCb: (typeof resolve === "function") ? resolve : null,
			errorCb: (typeof reject === "function") ? reject : null,
			forwarder: new Deferral()
		};
	if (this.state === "resolved" && handlers.successCb){
		resolve(this.value);
	}else if(this.state === "rejected"  && handlers.errorCb){
		reject(this.value);
	}else{
		this.handlerGroups.push(handlers);
	}
	return handlers.forwarder.$promise;
}

$Promise.prototype.catch = function(reject){
	return this.then(null, reject);
}

function defer(){
	return new Deferral();
}

function Deferral(){
	this.$promise = new $Promise();
}

Deferral.prototype.resolve = function(value){

	if(this.$promise.state === "pending"){
		this.$promise.value = value;
		this.$promise.state = "resolved";
		var nextHandler;
		//go over every handler of thise promise
		while(this.$promise.handlerGroups.length > 0){
			nextHandler = this.$promise.handlerGroups.shift();
			//if there is a successCb, call it -- else resolve the forwarder
			if(nextHandler.successCb){
				try{
					var nextVal = nextHandler.successCb(value);
					if (nextVal && nextVal.constructor === $Promise){
						//make nextHandler.forwarder.$promise mimic this.$promise
						console.log(this, nextVal, nextHandler);
						//nextVal.handlerGroups.push(nextHandler);
						//nextHandler = nextVal;
					}else{
						nextHandler.forwarder.resolve(nextVal);
					}
				}catch(err){
					nextHandler.forwarder.reject(err);
				}
			}else{
				nextHandler.forwarder.resolve(value);
			}	
		}
		if(this.$promise.handlerGroups.length === 0 && nextHandler){
			return nextHandler.forwarder.$promise;
		}else{
			return this.$promise.value;
		}
	}

}

Deferral.prototype.reject = function(error){
	if(this.$promise.state === "pending"){
		this.$promise.value = error;
		this.$promise.state = "rejected";
		while(this.$promise.handlerGroups.length > 0){
			var nextHandler = this.$promise.handlerGroups.shift();
			if(nextHandler.errorCb){
				try{
					var nextVal = nextHandler.errorCb(error);
					nextHandler.forwarder.resolve(nextVal);
				}catch(err){
					nextHandler.forwarder.reject(err);
				}	
			}else{
				nextHandler.forwarder.reject(error);
			}	
		}
		if(this.$promise.handlerGroups.length === 0 && nextHandler){
			return nextHandler.forwarder.$promise;
		}
	}
}





/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
