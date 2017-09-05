// Generic function to perform the filtering - this function shouldn't need to change
function filterSubGrid(subgridName, fetchXml, attempts) {
    // Try 10 times, then stop
    if (attempts < 0) { return; }

    var crmWindow = Xrm.Internal.isTurboForm() ? parent.window : window;

    // Get the subgrid element to filter
    var subgrid = crmWindow.document.getElementById(subgridName);
    if (subgrid == null || subgrid.control == null) {
        // If the subgrid hasn't loaded yet, keep trying
        setTimeout(function () { filterSubGrid(subgridName, fetchXml, (attempts || 10) - 1); }, 500);
        return;
    }

    // Update the fetchXml on the subgrid and refresh the grid
    subgrid.control.SetParameter("fetchXml", fetchXml);
    subgrid.control.refresh();
}

// Filters an accounts subgrid by the primary contact ID - this function is inique for your requirements
function filterAccountGrid() {
    // Get the dynamic contactId to filter on
    var contactValue = Xrm.Page.getAttribute("primarycontactid").getValue();

    // If the contact is null display nothing 
    var contactId = "00000000-0000-0000-0000-000000000000";
    if (contactValue != null) {
        contactId = contactValue[0].id;
    }

    // Fetch xml code which will retrieve all the accounts related to the contact 
    var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
    "  <entity name='account'>" +
    "    <attribute name='name' />" +
    "    <attribute name='address1_city' />" +
    "    <attribute name='primarycontactid' />" +
    "    <attribute name='telephone1' />" +
    "    <attribute name='accountid' />" +
    "    <order attribute='name' descending='false' />" +
    "    <filter type='and'>" +
    "      <condition attribute='primarycontactid' operator='eq' uitype='contact' value='" + contactId + "' />" +
    "    </filter>" +
    "    <link-entity name='contact' from='contactid' to='primarycontactid' visible='false' link-type='outer' alias='accountprimarycontactidcontactcontactid'>" +
    "      <attribute name='emailaddress1' />" +
    "    </link-entity>" +
    "  </entity>" +
    "</fetch>";

    filterSubGrid("Accounts", fetchXml);
}
