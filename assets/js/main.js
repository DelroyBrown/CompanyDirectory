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

    // Replicate the logic of the refresh button click to open the add modal for the table that is currently on display

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
        })
    }

});

$("#personnelBtn").click(function () {
    loadPersonnel();
});

$("#departmentsBtn").click(function () {
    loadDepartments();
});

$("#locationsBtn").click(function () {

    // Call function to refresh location table

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


// Executes when the form button with type="submit" is clicked

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
                                <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${dept.id}">
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
