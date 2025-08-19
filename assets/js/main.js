$(document).ready(function () {
    loadPersonnel();
});

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

$("#addBtn").click(function () {

    if ($("#personnelBtn").hasClass("active")) {

        $("#addPersonnelForm")[0].reset();

        $.ajax({
            url: "libs/php/getAllDepartments.php",
            type: "GET",
            dataType: "json",
            success: function (result) {
                if (result.status.code === "200") {
                    $("#addPersonnelDepartment").html("");
                    result.data.forEach(dept => {
                        $("#addPersonnelDepartment").append(
                            $("<option>", {
                                value: dept.id,
                                text: dept.department
                            })
                        );
                    });

                    $("#addPersonnelModal").modal("show");
                }
            }
        });

    } else if ($("#departmentsBtn").hasClass("active")) {
        $("#addDepartmentForm")[0].reset();

        $.ajax({
            url: "libs/php/getAllLocations.php",
            type: "GET",
            dataType: "json",
            success: function (result) {
                if (result.status.code === "200") {
                    $("#addDepartmentLocation").html("");
                    result.data.forEach(loc => {
                        $("#addDepartmentLocation").append(
                            $("<option>", {
                                value: loc.id,
                                text: loc.name
                            })
                        );
                    });

                    $("#addDepartmentModal").modal("show");
                }
            }
        });

    } else if ($("#locationsBtn").hasClass("active")) {
        $("#addLocationForm")[0].reset();
        $("#addLocationError").addClass("d-none");
        $("#addLocationModal").modal("show");
    }

});

const filterState = {
    personnel: { departmentID: "", locationID: "" },
    departments: { locationID: "" },
    locations: {}
};

// Filter Button Logic
$("#filterBtn").click(function () {
    const onPersonnel = $("#personnelBtn").hasClass("active");
    const onDepartments = $("#departmentsBtn").hasClass("active") || $("#departmentBtn").hasClass("active");
    const onLocations = $("#locationsBtn").hasClass("active") || $("#locationBtn").hasClass("active");

    // Show only the relevant filter block and populate accordingly
    $("#filters-personnel").toggleClass("d-none", !onPersonnel);
    $("#filters-departments").toggleClass("d-none", !onDepartments);
    $("#filters-locations").toggleClass("d-none", !onLocations);

    // Title
    $("#filterModalLabel").text(
        onPersonnel ? "Personnel Filters" :
            onDepartments ? "Department Filters" :
                "Location Filters"
    );

    if (onPersonnel) {
        // Departments
        $.ajax({
            url: "libs/php/getAllDepartments.php",
            type: "GET",
            dataType: "json",
            success: function (res) {
                const $sel = $("#personnelFilterDepartment")
                    .empty()
                    .append('<option value="">All departments</option>');
                (res && res.data ? res.data : []).forEach(function (d) {
                    // expected shape: { id, department, location }
                    $sel.append('<option value="' + d.id + '">' + d.department + '</option>');
                });
                if (filterState.personnel.departmentID) {
                    $sel.val(filterState.personnel.departmentID);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error loading departments:", textStatus, errorThrown);
            }
        });

        // Locations
        $.ajax({
            url: "libs/php/getAllLocations.php",
            type: "GET",
            dataType: "json",
            success: function (res) {
                const $sel = $("#personnelFilterLocation")
                    .empty()
                    .append('<option value="">All locations</option>');
                (res && res.data ? res.data : []).forEach(function (l) {
                    // expected shape: { id, name }
                    $sel.append('<option value="' + l.id + '">' + l.name + '</option>');
                });
                if (filterState.personnel.locationID) {
                    $sel.val(filterState.personnel.locationID);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error loading locations:", textStatus, errorThrown);
            }
        });
    }

    if (onDepartments) {
        $.ajax({
            url: "libs/php/getAllLocations.php",
            type: "GET",
            dataType: "json",
            success: function (res) {
                const $sel = $("#departmentsFilterLocation")
                    .empty()
                    .append('<option value="">All locations</option>');


                (res && res.data ? res.data : []).forEach(function (loc) {
                    $sel.append('<option value="' + loc.id + '">' + loc.name + '</option>');
                });

                if (filterState?.departments?.locationID) {
                    $sel.val(filterState.departments.locationID);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error loading locations (departments filter):", textStatus, errorThrown);
            }
        });
    }


    // Show modal
    var modal = new bootstrap.Modal(document.getElementById("filterModal"));
    modal.show();
});

// Apply filters
$("#filterApplyBtn").on("click", function () {
    const q = $("#searchInp").val().trim();

    if ($("#personnelBtn").hasClass("active")) {
        filterState.personnel.departmentID = $("#personnelFilterDepartment").val() || "";
        filterState.personnel.locationID = $("#personnelFilterLocation").val() || "";
        loadPersonnel(q, filterState.personnel);

    } else if ($("#departmentsBtn").hasClass("active") || $("#departmentBtn").hasClass("active")) {
        // Departments: filter by location
        filterState.departments.locationID = $("#departmentsFilterLocation").val() || "";
        loadDepartments(q, filterState.departments);

    } else if ($("#locationsBtn").hasClass("active") || $("#locationBtn").hasClass("active")) {
        // No filters yet for locations
        loadLocations(q);
    }

    $("#filterModal").modal("hide");
});

// Clear filters
$("#filterClearBtn").on("click", function () {
    const q = $("#searchInp").val().trim();

    if ($("#personnelBtn").hasClass("active")) {
        filterState.personnel = { departmentID: "", locationID: "" };
        $("#personnelFilterDepartment").val("");
        $("#personnelFilterLocation").val("");
        loadPersonnel(q, filterState.personnel);

    } else if ($("#departmentsBtn").hasClass("active") || $("#departmentBtn").hasClass("active")) {
        filterState.departments = { locationID: "" };
        $("#departmentsFilterLocation").val("");
        loadDepartments(q, filterState.departments);

    } else if ($("#locationsBtn").hasClass("active") || $("#locationBtn").hasClass("active")) {
        loadLocations(q);
    }

    $("#filterModal").modal("hide");
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




function loadDepartments(q = "", filters = {}) {
    const useSearch = (q || "").trim().length > 0;
    const locationID = (filters && filters.locationID) ? String(filters.locationID) : "";

    let url;
    if (useSearch) {
        // Search takes precedence over filters
        url = "libs/php/SearchAll.php?txt=" + encodeURIComponent(q);
    } else if (locationID) {
        // Filtered list by location
        url = "libs/php/getAllDepartments.php?locationID=" + encodeURIComponent(locationID);
    } else {
        // Unfiltered list
        url = "libs/php/getAllDepartments.php";
    }

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (result) {
            let rows = [];
            if (useSearch) {
                const found = (result && result.data && Array.isArray(result.data.found)) ? result.data.found : [];
                rows = found
                    .filter(x => (x.entity === "department") || (x.name && !x.firstName && !x.lastName))
                    .map(d => ({
                        id: d.id,
                        department: d.name, // map to your expected field
                        location: d.locationName ?? d.location ?? ""
                    }));
            } else {
                rows = result.data || [];
            }

            const $tbody = $("#departmentTableBody").empty();
            rows.forEach(dept => {
                $tbody.append(`
          <tr>
            <td class="align-middle text-nowrap">${dept.department}</td>
            <td class="align-middle text-nowrap d-none d-md-table-cell">${dept.location}</td>
            <td class="align-middle text-end text-nowrap">
              <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal"
                      data-bs-target="#editDepartmentModal" data-id="${dept.id}">
                <i class="fa-solid fa-pencil fa-fw"></i>
              </button>
              <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn"
                      data-bs-toggle="modal"
                      data-bs-target="#deleteDepartmentModal"
                      data-id="${dept.id}"
                      data-name="${dept.department}">
                <i class="fa-solid fa-trash fa-fw"></i>
              </button>
            </td>
          </tr>
        `);
            });
        },
        error: function () {
            alert("Failed to load departments");
        }
    });
}



function loadPersonnel(q = "", filters = {}) {
    const dep = filters.departmentID || "";
    const loc = filters.locationID || "";

    let url;
    if (q) {
        // When searching, we use SearchAll.php
        url = "libs/php/SearchAll.php?txt=" + encodeURIComponent(q);
    } else if (dep || loc) {
        // Filtered listing via getAll.php with params
        const params = new URLSearchParams();
        if (dep) params.append("departmentID", dep);
        if (loc) params.append("locationID", loc);
        url = "libs/php/getAll.php?" + params.toString();
    } else {
        // Unfiltered
        url = "libs/php/getAll.php";
    }

    $.ajax({
        url,
        type: "GET",
        dataType: "json",
        success: function (result) {
            let rows = [];
            if (q) {
                const found = (result?.data?.found) || [];
                rows = found
                    .filter(x => (x.entity === "personnel") || ("firstName" in x && "lastName" in x))
                    .map(p => ({
                        id: p.id,
                        firstName: p.firstName,
                        lastName: p.lastName,
                        jobTitle: p.jobTitle ?? "",
                        location: p.locationName ?? p.location ?? "",
                        email: p.email ?? ""
                    }));
            } else {
                rows = result.data || [];
            }

            const tbody = $("#personnelTableBody").empty();
            rows.forEach(person => {
                const row = `
          <tr>
            <td class="align-middle text-nowrap">${person.lastName}, ${person.firstName}</td>
            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.jobTitle}</td>
            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.location ?? ""}</td>
            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
            <td class="text-end text-nowrap">
              <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal"
                      data-bs-target="#editPersonnelModal" data-id="${person.id}">
                <i class="fa-solid fa-pencil fa-fw"></i>
              </button>
              <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal"
                      data-bs-target="#deletePersonnelModal" data-id="${person.id}">
                <i class="fa-solid fa-trash fa-fw"></i>
              </button>
            </td>
          </tr>
        `;
                tbody.append(row);
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
        }
    });
}



function loadLocations(q = "") {
    const useSearch = q.length > 0;
    const url = useSearch
        ? "libs/php/SearchAll.php?txt=" + encodeURIComponent(q)
        : "libs/php/getAllLocations.php";

    $.ajax({
        url,
        type: "GET",
        dataType: "json",
        success: function (result) {
            let rows = [];
            if (useSearch) {
                const found = (result?.data?.found) || [];
                rows = found
                    .filter(x => (x.entity === "location") || (x.name && !x.department && !x.firstName))
                    .map(l => ({ id: l.id, name: l.name }));
            } else {
                rows = result.data;
            }

            $("#locationTableBody").html("");
            rows.forEach(location => {
                $("#locationTableBody").append(`
          <tr>
            <td class="align-middle text-nowrap">${location.name}</td>
            <td class="align-middle text-end text-nowrap">
              <button type="button" class="btn btn-primary btn-sm editLocationBtn" data-id="${location.id}">
                <i class="fa-solid fa-pencil fa-fw"></i>
              </button>
              <button type="button" class="btn btn-primary btn-sm deleteLocationBtn" data-id="${location.id}" data-name="${location.name}">
                <i class="fa-solid fa-trash fa-fw"></i>
              </button>
            </td>
          </tr>
        `);
            });
        },
        error: function () {
            alert("AJAX error loading locations");
        }
    });
}


