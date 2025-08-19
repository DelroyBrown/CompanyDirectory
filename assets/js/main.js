$(document).ready(function () {
    loadPersonnel();
});

$("#personnelBtn").click(function () {
    loadPersonnel(); // Reload when tab is clicked
});


$("#searchInp").on("keyup", function () {

    // your code

});

$("#refreshBtn").click(function () {

    if ($("#personnelBtn").hasClass("active")) {

        // Refresh personnel table

    } else {

        if ($("#departmentsBtn").hasClass("active")) {

            // Refresh department table

        } else {

            // Refresh location table

        }

    }

});

$("#filterBtn").click(function () {

    // Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location

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


$("#personnelBtn").click(function () {
    loadPersonnel();
});

$("#departmentsBtn").click(function () {
    loadDepartments();
});

$("#locationsBtn").click(function () {
    loadLocations();
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




function loadDepartments() {
    $.ajax({
        url: "libs/php/getAllDepartments.php",
        type: "GET",
        dataType: "json",
        success: function (result) {
            console.log(result.data);

            if (result.status.code === "200") {
                $("#departmentTableBody").html(""); // Clear existing rows

                result.data.forEach(dept => {
                    $("#departmentTableBody").append(`
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
            }
        },
        error: function () {
            alert("Failed to load departments");
        }
    });
}

function loadPersonnel() {
    $.ajax({
        url: "libs/php/getAll.php",
        type: "GET",
        dataType: "json",
        success: function (result) {
            if (result.status.code == 200) {
                const personnelData = result.data;
                const tableBody = $("#personnelTableBody");

                tableBody.empty(); // Clear old rows

                personnelData.forEach(person => {
                    const row = `
                        <tr>
                            <td class="align-middle text-nowrap">
                                ${person.lastName}, ${person.firstName}
                            </td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">
                                ${person.jobTitle}
                            </td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">
                                ${person.location}
                            </td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">
                                ${person.email}
                            </td>
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
                    tableBody.append(row);
                });
            } else {
                console.error("Error loading personnel:", result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
        }
    });
}

function loadLocations() {
    $.ajax({
        url: "libs/php/getAllLocations.php",
        type: "GET",
        dataType: "json",
        success: function (result) {
            if (result.status.code === "200") {
                $("#locationTableBody").html("")

                result.data.forEach(location => {
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
            } else {
                alert("Failed to load locations");
            }
        },
        error: function () {
            alert("AJAX error loading locations");
        }
    });
}

