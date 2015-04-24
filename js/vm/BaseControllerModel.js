'use strict';
define(
	['knockout'],
	function (ko) {
		/**
		 * Base controller model - base model that implements standard controller behaviour and is suitable
		 * for easy extending
		 *
		 * @param componentParameters
		 * @param controller
		 * @constructor
		 */
		function BaseControllerModel (componentParameters, controller) {
			this.$$originalData = componentParameters;
			this.$$controller = controller;
			this.$$loading = ko.observable(true);
			this.$$error = ko.observable(null);
			this.$$rawdata = null;
			this.$$loadingItems = 0;
		}

		/**
		 * Method that loads everything that is commonly needed
		 */
		BaseControllerModel.prototype.run = function () {
			var self = this;

			/**
			 * We set here how many loading steps do we take
			 * @type {number}
			 */
			this.$$loadingItems = 4;

			// Loading needed view models
			this.$$controller.loadViewModels(this.getUsedModels(), function () {
				self.$$loadingItems--;
				self.checkInitialLoadCompletion();
			});

			// Loading data
			this.$$controller.loadData(
				this.dataURL(),
				this.dataPOSTParameters(),
				function (text, request) {
					try {
						self.$$rawdata = JSON.parse(text);
					}
					catch (e) {
						self.$$error('Request failed: wrong response.');
						return;
					}

					self.$$loadingItems--;
					self.checkInitialLoadCompletion();
				},
				function (request) {
					self.$$error('Request failed: ' + request.status + ': ' + request.statusText);
				},
				function (request) {
					self.$$error('Request timed out.');
				}
			);

			// Loading i18n
			this.$$controller.loadI18n(
				this.getI18nSegments(),
				function () {
					self.$$loadingItems--;
					self.checkInitialLoadCompletion();
				},
				function () {
					self.$$error('Could not load i18n data.');
				}
			);

			// Loading needed ko bindings
			this.$$controller.loadKOBindings(
				this.getKOBindings(),
				function () {
					self.$$loadingItems--;
					self.checkInitialLoadCompletion();
				},
				function () {
					self.$$error('Could not load KO bindings.');
				}
			);
		};

		/**
		 * Method that checks if we have loaded everything and if successful - starts a conversion of raw data into ViewModel structure
		 */
		BaseControllerModel.prototype.checkInitialLoadCompletion = function () {
			if (this.$$loadingItems == 0) {
				this.$$controller.log('Finished initial loading of', this, ' starting to build models: ', this.$$rawdata);
				this.buildModels();
				this.$$loading(false);
			}
		};

		/**
		 * Returns an array of used ViewModels' names
		 * @returns {Array}
		 */
		BaseControllerModel.prototype.getUsedModels = function () {
			return this.$$usedModels;
		};

		/**
		 * Returns an array of used i18n segments' names
		 * @returns {Array}
		 */
		BaseControllerModel.prototype.getI18nSegments = function () {
			return this.$$i18nSegments;
		};

		/**
		 * Returns an array of used knockout bindings packages' names
		 * @returns {Array}
		 */
		BaseControllerModel.prototype.getKOBindings = function () {
			return this.$$KOBindings;
		};

		BaseControllerModel.prototype.buildModels = function () {};

		BaseControllerModel.prototype.dataURL = function () {};

		BaseControllerModel.prototype.dataPOSTParameters = function () {};

		BaseControllerModel.prototype.koBindingsModule = function () {};

		BaseControllerModel.prototype.i18nSegment = '';

		BaseControllerModel.prototype.$$usedModels = [];

		BaseControllerModel.prototype.$$i18nSegments = [];

		BaseControllerModel.prototype.$$KOBindings = [];

		return BaseControllerModel;
	}
);