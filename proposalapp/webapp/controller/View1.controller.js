sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	'sap/m/MessageBox'
], function(Controller, JSONModel, MessageToast, MessageBox) {
	"use strict";
	var that;
	return Controller.extend("PersephonePersephone.controller.View1", {
		onInit: function() {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			this._oTable = oTable;
			// keeps the search state
			this._oTableSearchState = [];
			that = this;
			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: "worklistTableTitle",
				saveAsTileTitle: "worklistViewTitle",
				shareOnJamTitle: "worklistViewTitle",
				shareSendEmailSubject: "shareSendEmailWorklistSubject",
				tableNoDataText: "No Proposals available",
				tableNoDataText2: "No Customers available",
				tableBusyDelay: 0,
				inStock: 0,
				shortage: 0,
				outOfStock: 0,
				countAll: 0
			});
			this.getView().setModel(oViewModel, "worklistView");
			/*var oDataUrl = "https";
			var oModel = new sap.ui.model.odata.v4.ODataModel({
				groupId: "$auto", // send requests directly. Use $auto for batch request wich will be send automatically on before rendering
				synchronizationMode: "None",
				serviceUrl: "/destinations/AnanthV4/odata/v4/CustomerService/"
			});*/

			//this.getView().setModel(oModel);
			//MessageManager
			//this.setMessageManager(this); currently commenting as everything in response works fine. and data is saved
			this.getOwnerComponent().getModel().setSizeLimit(300); // https://github.com/SAP/openui5/issues/790
		},
		setMessageManager: function(that) {
			var bMessageOpen = false,
				oMessageManager = sap.ui.getCore().getMessageManager(),
				oMessageModel = oMessageManager.getMessageModel();

			this.oMessageModelBinding = oMessageModel.bindList("/", undefined, [], new sap.ui.model.Filter("technical", sap.ui.model.FilterOperator
				.EQ, true));

			this.oMessageModelBinding.attachChange(function(oEvent) {
				var aContexts = oEvent.getSource().getContexts(),
					aMessages = [],
					sPrefix;

				if (bMessageOpen || !aContexts.length) {
					return;
				}

				// Extract and remove the technical messages
				aContexts.forEach(function(oContext) {
					aMessages.push(oContext.getObject());
				});
				oMessageManager.removeMessages(aMessages);

				// Due to batching there can be more than one technical message. However the UX
				// guidelines say "display a single message in a message box" assuming that there
				// will be only one at a time.
				sPrefix = aMessages.length === 1 ? "" : "There have been multiple technical errors. One example: ";
				MessageBox.error(sPrefix + aMessages[0].message, {
					id: "serviceErrorMessageBox",
					onClose: function() {
						bMessageOpen = false;
						var oBinding = this.byId("table").getBinding("items");
						oBinding.resetChanges("proposalGroup");
						var oModel = this.getView().getModel();
						oModel.refresh();
					}.bind(that)
				});
				bMessageOpen = true;
			});
		},
		onSave: function() {
			var oView = this.getView();

			/*function resetBusy() {
			    oView.setBusy(false);
			}*/

			// lock UI until submitBatch is resolved, to prevent errors caused by updates while submitBatch is pending
			//oView.setBusy(true);

			oView.getModel().submitBatch(oView.getModel().getUpdateGroupId()).then(function() {
			//Since response is working crctly doing this work around
				var oBinding = this.byId("table").getBinding("items");
						oBinding.resetChanges("proposalGroup");
						var oModel = this.getView().getModel();
						oModel.refresh();
			}.bind(this), function() {

			}); //add success and error handler
		},
		onPressDeleteProposal: function() {
			var oView = this.getView();
			var oTable = oView.byId("table");
			var oContext = oTable.getSelectedItem().getBindingContext();
			oContext.delete("$auto").then(function() {
				oTable.removeSelections();
				MessageBox.alert("Deleted", {
					icon: MessageBox.Icon.SUCCESS,
					title: "Success"
				});
			}, function(oError) {
				MessageBox.alert("Could not delete: " + oError.message, {
					icon: MessageBox.Icon.ERROR,
					title: "Error"
				});
			});
		},
		openCreateProposal: function() {
			var oViewModel = this.getView().getModel();
			var oSimpleForm1 = new sap.ui.layout.form.SimpleForm("Form1", {
				layout: 'ResponsiveGridLayout',
				editable: true,
				content: [
					new sap.m.Label({
						labelFor: "firstName",
						text: "First Name",
						tooltip: "First Name"
					}),
					new sap.m.Input({
						id: "firstName"
					}),
					new sap.m.Label({
						labelFor: "lastName",
						text: "Last Name",
						tooltip: "LastName"
					}),
					new sap.m.Input({
						id: "lastName"
					}),
					new sap.m.Label({
						labelFor: "country",
						text: "Country",
						tooltip: "Country"
					}),
					new sap.m.Select({
						id: "country",
						items: [
							new sap.ui.core.Item({
								key: "AL",
								text: "AL - Albania"
							}),
							new sap.ui.core.Item({
								key: "AM",
								text: "AM - Armenia"
							}),
							new sap.ui.core.Item({
								key: "US",
								text: "US - United States"
							}),
							new sap.ui.core.Item({
								key: "IN",
								text: "IN - India"
							}),
							new sap.ui.core.Item({
								key: "ES",
								text: "ES - Spain"
							}),
							new sap.ui.core.Item({
								key: "DE",
								text: "DE - Germany"
							})
						]
					}),

					new sap.m.Label({
						labelFor: "city",
						text: "City",
						tooltip: "City"
					}),
					new sap.m.Input({
						id: "city"
					})
					/*new sap.m.Label({
						labelFor: "approvedBy",
						text: "Approved By",
						tooltip: "Approved By"
					}),
					new sap.m.Input({
						id: "approvedBy"
					}),*/
					/*new sap.m.Label({
						labelFor: "approvalStatus",
						text: "ApprovalStatus",
						tooltip: "ApprovalStatus"
					}),
					new sap.m.Select({
						id: "approvalStatus",
						items : [
							new sap.ui.core.Item({key : "new" , text : "New"}),	
							new sap.ui.core.Item({key : "proposed" , text : "Proposed"})	
						]
					})*/
				]
			});

			oSimpleForm1.bindElement("/ProductProposals");
			oSimpleForm1.setModel(oViewModel);
			var createProposal = function(oEvent) {
				/*var oModel = oViewModel;
				oModel._submitBatch(oModel.getGroupId());*/
				var oContext = that.getView().byId("table").getBinding("items")
					.create({
						//"ProposalID": Math.floor(Math.random() * 1000) + 1, // a random between 0 - 1000 (till backend creates auto - generated values)
						//"CustomerID": sap.ui.getCore().byId("customerID").getValue(),
						"FirstName": sap.ui.getCore().byId("firstName").getValue(),
						"LastName": sap.ui.getCore().byId("lastName").getValue(),
						"Country": sap.ui.getCore().byId("country").getSelectedKey(),
						"City": sap.ui.getCore().byId("city").getValue(),
						//"ProposedBy": sap.ui.getCore().byId("proposedBy").getValue(),
						//"ApprovedBy": sap.ui.getCore().byId("approvedBy").getValue(),
						"ApprovalStatus": "new"
					});

				/*// Note: This promise fails only if the transient entity is deleted
				oContext.created().then(function() {
					// sales order successfully created
					MessageToast.show("Created a proposal");
					
				},function(reason){
					MessageToast.show(reason);
				});*/

				//since update group id is added and group id is changed to direct after creating context need to submit batch
				that.onSave();
				oEvent.getSource().getParent().destroyContent();
				oEvent.getSource().getParent().close();
			};
			var dialog = new sap.m.Dialog({
				resizable: true,
				draggable: true,
				contentHeight: "auto",
				title: "Create Proposal",
				content: [
					oSimpleForm1
				],
				beginButton: new sap.m.Button({
					text: "Create",
					press: createProposal
				}),
				endButton: [
					new sap.m.Button({
						text: "Close",
						press: function(oEvent) {
							oEvent.getSource().getParent().destroyContent();
							oEvent.getSource().getParent().close();
						}
					})
				]
			});

			dialog.open();
		},
		status :  function (sStatus) {
				if (sStatus === "approved") {
					return "Success";
				} else if (sStatus === "new") {
					return "Warning";
				} else if (sStatus === "rejected" || sStatus === "reject"){
					return "Error";
				} else {
					return "None";
				}
		},
		onTabPressed : function(oEvent){
			if(oEvent.getParameter("selectedItem").getKey() === "Customers"){
				this.byId("createProposal").setVisible(false);
				this.byId("deleteProposal").setVisible(false);
			}else{
				this.byId("createProposal").setVisible(true);
				this.byId("deleteProposal").setVisible(true);
			}
		},
		onTableItemSelectionChange : function(){
			var oTable = this._oTable;
			if (oTable.getSelectedItems().length === 1) {
				var oListItem = oTable.getSelectedItem();
				var status = oListItem.getBindingContext().getProperty("ApprovalStatus");
				if(status === "approved" || status === "reject" || status === "rejected"){
					this.byId("deleteProposal").setEnabled(false);
				}else{
					this.byId("deleteProposal").setEnabled(true);
				}
			}
		},
		formatCountryCode : function(sValue){
			if(sValue === "AL"){
				return "Albania";
			}else if(sValue === "AM"){
				return "Armenia";
			}
			else if(sValue === "US"){
				return "United States";	
			}
			else if(sValue === "IN"){
				return "India";	
			}
			else if(sValue === "ES"){
				return "Spain";
			}
			else if(sValue === "DE"){
				return "Germany";
			}
		}
	});
});