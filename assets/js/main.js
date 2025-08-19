import { loadDepartments as modLoadDepartments } from "./departments.js";
import { loadLocations as modLoadLocations } from "./locations.js";
import { loadPersonnel as modLoadPersonnel } from "./personnel.js";
import { bindFilterModal } from "./filters.js";
import { bindAddModals } from "./addModals.js";



$(document).ready(function () {
    loadPersonnel();
});

const loadDepartments = modLoadDepartments;
const loadLocations = modLoadLocations;
const loadPersonnel = modLoadPersonnel;

window.loadDepartments = loadDepartments;
window.loadPersonnel = loadPersonnel;
window.loadLocations = loadLocations;

// attach the filter modals
bindFilterModal({ loadPersonnel, loadDepartments, loadLocations });

bindAddModals();


// Debounce for search
let _searchTimer = null;
const SEARCH_DEBOUNCE_MS = 300;

$("#searchInp").on("input", function () {
    const q = $(this).val().trim();
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => {
        if ($("#personnelBtn").hasClass("active")) {
            loadPersonnel(q);
        } else if ($("#departmentsBtn").hasClass("active")) {
            loadDepartments(q);
        } else if ($("#locationsBtn").hasClass("active")) {
            loadLocations(q);
        }
    }, SEARCH_DEBOUNCE_MS);
});


$("#refreshBtn").on("click", function () {

    const q = $("#searchInp").val().trim();

    if ($("#personnelBtn").hasClass("active")) {
        loadPersonnel();
    } else if ($("#departmentsBtn").hasClass("active")) {
        loadDepartments();
    } else if ($("#locationsBtn").hasClass("active")) {
        loadLocations();
    }
});

$("#addBtn").off("click").on("click", function () {
    if ($("#personnelBtn").hasClass("active")) {
        $("#addPersonnelModal").modal("show");
    } else if ($("#departmentsBtn").hasClass("active") || $("#departmentBtn").hasClass("active")) {
        $("#addDepartmentModal").modal("show");
    } else if ($("#locationsBtn").hasClass("active") || $("#locationBtn").hasClass("active")) {
        $("#addLocationModal").modal("show");
    }
});



$("#personnelBtn").click(function () {
    const q = $("#searchInp").val().trim();
    loadPersonnel(q);
});

$("#departmentsBtn").click(function () {
    const q = $("#searchInp").val().trim();
    loadDepartments(q);
});

$("#locationsBtn").click(function () {
    const q = $("#searchInp").val().trim();
    loadLocations(q);
});

$("#editPersonnelModal").on("show.bs.modal", function (e) {

    $.ajax({
        url: "libs/php/getPersonnelByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: $(e.relatedTarget).attr("data-id")
        },
        success: function (result) {
            var resultCode = result.status.code;

            if (resultCode == 200) {
                $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);
                $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
                $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
                $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
                $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

                $("#editPersonnelDepartment").html("");

                $.each(result.data.department, function () {
                    $("#editPersonnelDepartment").append(
                        $("<option>", {
                            value: this.id,
                            text: this.name
                        })
                    );
                });

                $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);

            } else {
                $("#editPersonnelModal .modal-title").text("Error retrieving data");
            }
        },
        error: function () {
            $("#editPersonnelModal .modal-title").text("Error retrieving data");
        }
    });
});

// Store ID when delete modal opens
$("#deletePersonnelModal").on("show.bs.modal", function (e) {
    const id = $(e.relatedTarget).data("id");
    $("#deletePersonnelID").val(id);
});

// When delete button is clicked
$("#confirmDeletePersonnelBtn").click(function () {
    const id = $("#deletePersonnelID").val();

    $.ajax({
        url: "libs/php/deletePersonnelByID.php",
        type: "POST",
        dataType: "json",
        data: { id: id },
        success: function (result) {
            if (result.status.code === "200") {
                $("#deletePersonnelModal").modal("hide");
                loadPersonnel();
            } else {
                alert("Delete Failed.");
            }
        },
        error: function () {
            alert("AJAX error during delete");
        }
    });
});

// Shows modal and sets department ID and name
$("#deleteDepartmentModal").on("show.bs.modal", function (e) {
    const id = $(e.relatedTarget).data("id");
    const name = $(e.relatedTarget).data("name");
    $("#deleteDepartmentID").val(id);
    $("#deleteDepartmentName").val(name);
    $("#deleteDepartmentMessage").html(`Are you sure you want to delete the <strong>${name}</strong> department?`);
    $("#deleteDepartmentError").addClass("d-none");

});

// Handles deletion
$("#confirmDeleteDepartmentBtn").click(function () {
    const id = $("#deleteDepartmentID").val();

    $.ajax({
        url: "libs/php/deleteDepartmentByID.php",
        type: "POST",
        dataType: "json",
        data: { id: id },
        success: function (result) {
            if (result.status.code === "200") {
                $("#deleteDepartmentModal").modal("hide");
                loadDepartments();
            } else if (result.status.code === "409") {
                // Dependency error shows the warning
                $("#deleteDepartmentError").removeClass("d-none");
            } else {
                alert("Delete failed.");
            }
        },

        error: function () {
            alert("AJAX error during delete.")
        }
    });
});

// Edit Department
$("#editDepartmentModal").on("show.bs.modal", function (e) {
    const id = $(e.relatedTarget).data("id");

    // Clear any old data
    $("#editDepartmentForm")[0].reset();
    $("#editDepartmentID").val(id);

    // Load locations for the dropdown
    $.ajax({
        url: "libs/php/getAllLocations.php",
        type: "GET",
        dataType: "json",
        success: function (result) {
            if (result.status.code === "200") {
                $("#editDepartmentLocation").html("");
                result.data.forEach(location => {
                    $("#editDepartmentLocation").append(
                        $("<option>", {
                            value: location.id,
                            text: location.name
                        })
                    );
                });
            }
        }
    });

    // Loads department details
    $.ajax({
        url: "libs/php/getDepartmentByID.php",
        type: "GET",
        dataType: "json",
        data: { id: id },
        success: function (result) {
            if (result.status.code === "200") {
                const dept = result.data[0];
                $("#editDepartmentName").val(dept.name);
                $("#editDepartmentLocation").val(dept.locationID);
            }
        }
    });


});

// Submit department edit
$("#editDepartmentForm").on("submit", function (e) {
    e.preventDefault();

    $.ajax({
        url: "libs/php/updateDepartment.php",
        type: "POST",
        dataType: "json",
        data: {
            id: $("#editDepartmentID").val(),
            name: $("#editDepartmentName").val(),
            locationID: $("#editDepartmentLocation").val()
        },
        success: function (result) {
            if (result.status.code === "200") {
                $("#editDepartmentModal").modal("hide");
                loadDepartments();
            } else {
                alert("Update failed.")
            }
        },
        error: function () {
            alert("AJAX error during update.");
        }
    });
});

// Add Department Form
$("#addDepartmentForm").on("submit", function (e) {
    e.preventDefault();

    const name = $("#addDepartmentName").val().trim();
    const locationID = $("#addDepartmentLocation").val();

    $.ajax({
        url: "libs/php/insertDepartment.php",
        type: "POST",
        dataType: "json",
        data: {
            name: name,
            locationID: locationID
        },
        success: function (result) {
            if (result.status.code === "200") {
                $("#addDepartmentModal").modal("hide");
                loadDepartments();
            } else if (result.status.code === "409") {
                $("#addDepartmentError")
                    .removeClass("d-none")
                    .text("This department already exists, please choose a different name");
            } else {
                alert("Department insert failed");
            }
        },
        error: function () {
            alert("AJAX error while adding department");
        }
    });
});


// Edit Personnell form
$("#editPersonnelForm").on("submit", function (e) {

    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour

    e.preventDefault();

    $.ajax({
        url: "libs/php/updatePersonnelById.php",
        type: "POST",
        dataType: "json",
        data: {
            "id": $("#editPersonnelEmployeeID").val(),
            "firstName": $("#editPersonnelFirstName").val(),
            "lastName": $("#editPersonnelLastName").val(),
            "jobTitle": $("#editPersonnelJobTitle").val(),
            "email": $("#editPersonnelEmailAddress").val(),
            "departmentID": $("#editPersonnelDepartment").val()
        },
        success: function (result) {
            if (result.status.code === "200") {
                $("#editPersonnelModal").modal("hide");
                loadPersonnel();
            } else {
                alert("Error saving changes");
            }
        },
        error: function () {
            alert("AJAX error while saving.");
        }
    });


});

// Add Personnell form
$("#addPersonnelForm").on("submit", function (e) {
    e.preventDefault();

    $.ajax({
        url: "libs/php/insertPersonnel.php",
        type: "POST",
        dataType: "json",
        data: {
            firstName: $("#addPersonnelFirstName").val(),
            lastName: $("#addPersonnelLastName").val(),
            jobTitle: $("#addPersonnelJobTitle").val(),
            email: $("#addPersonnelEmailAddress").val(),
            departmentID: $("#addPersonnelDepartment").val()
        },
        success: function (result) {
            if (result.status.code === "200") {
                $("#addPersonnelModal").modal("hide");
                loadPersonnel(); // refresh the table
            } else {
                alert("Insert failed");
            }
        },
        error: function () {
            alert("AJAX insert error");
        }
    });
    console.log({
        firstName: $("#addPersonnelFirstName").val(),
        lastName: $("#addPersonnelLastName").val(),
        jobTitle: $("#addPersonnelJobTitle").val(),
        email: $("#addPersonnelEmailAddress").val(),
        departmentID: $("#addPersonnelDepartment").val()
    });

});

// Add Location Form
$("#addLocationForm").on("submit", function (e) {
    e.preventDefault();

    const name = $("#addLocationName").val().trim();

    $.ajax({
        url: "libs/php/insertLocation.php",
        type: "POST",
        dataType: "json",
        data: { name: name },
        success: function (result) {
            if (result.status.code === "200") {
                $("#addLocationModal").modal("hide");
                $("#addLocationForm")[0].reset();
                $("#addLocationError").addClass("d-none");

                loadLocations();
            } else if (result.status.code) {
                $("#addLocationError").removeClass("d-none");
            } else {
                alert("Failed to add location");
            }
        },
        error: function () {
            alert("AJAX error while adding location.")
        }
    });
});

// Edit Location modal and populate
$(document).on("click", ".editLocationBtn", function () {
    const id = $(this).data("id");

    $("#editLocationForm")[0].reset();
    $("#editLocationID").val(id);
    $("#editLocationError").addClass("d-none");


    $.ajax({
        url: "libs/php/getLocationByID.php",
        type: "GET",
        dataType: "json",
        data: { id: id },
        success: function (result) {
            if (result.status.code === "200") {
                const location = result.data[0];
                $("#editLocationName").val(location.name);
                $("#editLocationModal").modal("show");
            } else {
                alert("Failed to fetch location details.");
            }
        },
        error: function () {
            alert("AJAX error fetching location.");
        }
    });
});

// Edit location form
$("#editLocationForm").on("submit", function (e) {
    e.preventDefault();

    const id = $("#editLocationID").val();
    const name = $("#editLocationName").val().trim();

    $.ajax({
        url: "libs/php/updateLocation.php",
        type: "POST",
        dataType: "json",
        data: { id: id, name: name },
        success: function (result) {
            if (result.status.code === "200") {
                $("#editLocationModal").modal("hide");
                loadLocations();
            } else if (result.status.code === "409") {
                $("#editLocationError").removeClass("d-none");
            } else {
                alert("Failed to update location");
            }
        },
        error: function () {
            alert("AJAX error updating location");
        }
    });
});

// Delete location
$(document).on("click", ".deleteLocationBtn", function () {
    const id = $(this).data("id");
    const name = $(this).data("name");

    $("#deleteLocationID").val(id);
    $("#deleteLocationName").val(name);
    $("#deleteLocationMessage").html(`Are you sure you want to delete <strong>${name}</strong>?`);
    $("#deleteLocationError").addClass("d-none");

    $("#deleteLocationModal").modal("show");
});

// Handle delete confirmation
$("#confirmDeleteLocationBtn").click(function () {
    const id = $("#deleteLocationID").val();

    $.ajax({
        url: "libs/php/deleteLocationByID.php",
        type: "POST",
        dataType: "json",
        data: { id: id },
        success: function (result) {
            if (result.status.code === "200") {
                $("#deleteLocationModal").modal("hide");
                loadLocations();
            } else if (result.status.code === "409") {
                $("#deleteLocationError").removeClass("d-none");
            } else {
                alert("Delete failed.");
            }
        },
        error: function () {
            alert("AJAX error during delete.");
        }
    });
});


// Departments logic
window.loadDepartments = modLoadDepartments;
// DELETE
console.debug("[modules] departments loader installed");


// Personnel logic
window.loadPersonnel = modLoadPersonnel;
// DELETE
console.debug("[modules] personnel loader installed");

// Locations logic
window.loadLocations = modLoadLocations;
// DELETE
console.debug("[modules] locations loader installed");
