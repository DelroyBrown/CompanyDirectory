export const API = {
    getAllDepartments(params = {}) {
        return $.ajax({
            url: "libs/php/departments/getAllDepartments.php",
            type: "GET",
            data: params,
            dataType: "json",
        });
    },
    getAllLocations() {
        return $.ajax({
            url: "libs/php/locations/getAllLocations.php",
            type: "GET",
            dataType: "json",
        });
    },
    searchAll(txt) {
        return $.ajax({
            url: "libs/php/SearchAll.php",
            type: "GET",
            data: { txt },
            dataType: "json",
        });
    },
    getPersonnelById(id) {
        return $.ajax({
            url: "libs/php/personnel/getPersonnelByID.php",
            type: "GET",
            dataType: "json",
            data: { id }
        });
    },
    getDepartmentById(id) {
        return $.ajax({
            url: "libs/php/departments/getDepartmentByID.php",
            type: "GET",
            dataType: "json",
            data: { id }
        });
    },
};