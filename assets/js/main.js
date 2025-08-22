import { loadDepartments as modLoadDepartments } from "./departments/departments.js";
import { loadLocations   as modLoadLocations   } from "./locations/locations.js";
import { loadPersonnel   as modLoadPersonnel   } from "./personnel/personnel.js";

import { bindFilterModal, filterState } from "./filters.js";

import { bindSearch } from "./search.js";
import { bindRefresh } from "./refresh.js";

import { bindPersonnelUI }   from "./personnel/personnel.ui.js";
import { bindDepartmentsUI } from "./departments/department.ui.js";
import { bindLocationsUI }   from "./locations/locations.ui.js";

// Local
const loadDepartments = modLoadDepartments;
const loadLocations   = modLoadLocations;
const loadPersonnel   = modLoadPersonnel;

// Binders
bindFilterModal({ loadPersonnel, loadDepartments, loadLocations });
bindSearch({ loadPersonnel, loadDepartments, loadLocations });
bindRefresh({ loadPersonnel, loadDepartments, loadLocations });

bindPersonnelUI({ loadPersonnel });
bindDepartmentsUI({ loadDepartments });
bindLocationsUI({ loadLocations });

// Initial load
$(function () {
  const q = $("#searchInp").val()?.trim() || "";
  loadPersonnel(q);
});

// Add button routes to the correct modal
$("#addBtn").off("click").on("click", function () {
  if ($("#personnelBtn").hasClass("active")) {
    $("#addPersonnelModal").modal("show");
  } else if ($("#departmentsBtn").hasClass("active") || $("#departmentBtn").hasClass("active")) {
    $("#addDepartmentModal").modal("show");
  } else if ($("#locationsBtn").hasClass("active") || $("#locationBtn").hasClass("active")) {
    $("#addLocationModal").modal("show");
  }
});

// Tabs
$("#personnelBtn").off("click").on("click", function () {
  const q = $("#searchInp").val().trim();
  loadPersonnel(q);
});

$("#departmentsBtn").off("click").on("click", function () {
  $("#searchInp").val("");
  loadDepartments("", filterState.departments);
});

$("#locationsBtn").off("click").on("click", function () {
  const q = $("#searchInp").val().trim();
  loadLocations(q);
});
