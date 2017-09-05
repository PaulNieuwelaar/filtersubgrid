# Filter Sub-Grid in Dynamics 365

![](https://user-images.githubusercontent.com/14048382/30043453-8f22b75c-924b-11e7-8e24-461008e20e9d.png)

In this example, I've added an "Accounts" sub-grid to my Account, configured to show "All Record Types" rather than "Only Related Records". The using this JavaScript we're filtering the sub-grid to display all the Accounts that the Primary Contact is a Primary Contact of (which will obviously include the current account). This function can be added to the form OnLoad and Primary Contact field OnChange to ensure the sub-grid is updated when the Primary Contact changes as well.
NOTE: I've found it best to create a custom view to be used as the default sub-grid view, and to customize this view to display no results by default (using a filter such as: Name equals "X" and Name does not equal "X" – which will always return no results), this way you won't see incorrect data initially on load before the JavaScript kicks in.

```javascript
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
```

Note: This code is unsupported, and is likely to break in any major releases (as it has in the past). The idea of sourcing this project on GitHub is that if/when it does break again, it can be updated here rather than having to release new blog posts and hoping people who have previously used it see it. Also if it breaks in an update and I don't get a chance to fix it, someone else can fix it :)

Created by [Paul Nieuwelaar](http://paulnieuwelaar.wordpress.com) - [@paulnz1](https://twitter.com/paulnz1)  
Sponsored by [Magnetism Solutions - Dynamics CRM Specialists](http://www.magnetismsolutions.com)
