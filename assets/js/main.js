import { loadDepartments as modLoadDepartments } from "./departments/departments.js";
import { loadLocations as modLoadLocations } from "./locations.js";
import { loadPersonnel as modLoadPersonnel } from "./personnel/personnel.js";
import { bindFilterModal } from "./filters.js";
import { filterState } from "./filters.js";
import { bindAddModals } from "./addModals.js";
import { bindSearch } from "./search.js";
import { bindRefresh } from "./refresh.js";
import { bindPersonnelUI } from "./personnel/personnel.ui.js";
import { bindDepartmentsUI } from "./departments/department.ui.js";

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

// attach the modals
bindAddModals();

// bind the search
bindSearch({
    loadPersonnel: window.loadPersonnel,
    loadDepartments: window.loadDepartments,
    loadLocations: window.loadLocations
});

// bind the refresh
bindRefresh({
    loadPersonnel: window.loadPersonnel,
    loadDepartments: window.loadDepartments,
    loadLocations: window.loadLocations,

});

// bind personnel ui
bindPersonnelUI({ loadPersonnel: window.loadPersonnel });

// bind departments ui
bindDepartmentsUI({ loadDepartments: window.loadDepartments });

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

$("#departmentsBtn").off("click").on("click", function () {
  $("#searchInp").val("");
  loadDepartments("", filterState.departments);
});

$("#locationsBtn").click(function () {
    const q = $("#searchInp").val().trim();
    loadLocations(q);
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


