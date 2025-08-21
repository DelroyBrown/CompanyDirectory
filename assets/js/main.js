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
import { bindLocationsUI } from "./locations.ui.js";

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

// bind locations ui
bindLocationsUI({ loadLocations: window.loadLocations });

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


