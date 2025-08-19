const filterState = {
    personnel: { departmentID: "", locationID: "" },
    departments: { locationID: "" },
    locations: {}
};

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

    // Show modal
    var modal = new bootstrap.Modal(document.getElementById("filterModal"));
    modal.show();
});

// Apply filters
$("#filterApplyBtn").on("click", function () {
    const q = $("#searchInp").val().trim();

    if ($("#personnelBtn").hasClass("active")) {
        filterState.personnel.departmentID = $("#personnelFilterDepartment").val();
        filterState.personnel.locationID = $("#personnelFilterLocation").val();
        // Your loader should already support (q, filters)
        loadPersonnel(q, filterState.personnel);
    } else if ($("#departmentsBtn").hasClass("active") || $("#departmentBtn").hasClass("active")) {
        // TODO when wiring dept filters (e.g., locationID)
        // loadDepartments(q, filterState.departments);
    } else if ($("#locationsBtn").hasClass("active") || $("#locationBtn").hasClass("active")) {
        // No filters yet for locations
        // loadLocations(q);
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
        // loadDepartments(q, filterState.departments);
    } else if ($("#locationsBtn").hasClass("active") || $("#locationBtn").hasClass("active")) {
        // loadLocations(q);
    }
});