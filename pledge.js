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
	this.handlerGroups.push(handlers);
	if (this.state !== "pending"){
		this.callHandlers();
	}
	return handlers.forwarder.$promise;
}

$Promise.prototype.catch = function(reject){
	return this.then(null, reject);
}

$Promise.prototype.callHandlers = function(value){
	var handlers = this.handlerGroups.shift();
	value = value || this.value;
	console.log(this, value);
	if(handlers){
		if(this.state === "resolved"){
			if(handlers.successCb){
				try{
					value = handlers.successCb(value);
				}catch(err){
					handlers.forwarder.reject(err);
				}
			}
			if(value && value.constructor === $Promise){
				value.handlerGroups.unshift({ successCb: null, errorCb: null, forwarder: handlers.forwarder});
			}else{
				handlers.forwarder.resolve(value);
			}
		}else if (this.state === "rejected"){
			if(handlers.errorCb){
				try{
					value = handlers.errorCb(value);
					if(value && value.constructor === $Promise){
						value.handlerGroups.unshift({ successCb: null, errorCb: null, forwarder: handlers.forwarder});
					}else{
						handlers.forwarder.resolve(value);
					}
				}catch(err){
					handlers.forwarder.reject(err);
				}
			}else{
				handlers.forwarder.reject(value);
			}	
		}
	}
	return undefined;
}

function defer(){
	return new Deferral();
}

function Deferral(promise){
	this.$promise = promise || new $Promise();
}

Deferral.prototype.resolve = function(value){
	if(this.$promise.state === "pending"){
		this.$promise.value = value;
		this.$promise.state = "resolved";
		while(this.$promise.handlerGroups.length > 0){
			this.$promise.callHandlers();
			
		}
	}
}

Deferral.prototype.reject = function(error){
	if(this.$promise.state === "pending"){
		this.$promise.value = error;
		this.$promise.state = "rejected";
		while(this.$promise.handlerGroups.length > 0){
			this.$promise.callHandlers();	
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
