export const API = {
    getAllDepartments(params = {}) {
        return $.ajax({
            url: "libs/php/getAllDepartments.php",
            type: "GET",
            data: params,
            dataType: "json",
        });
    },
    getAllLocations() {
        return $.ajax({
            url: "libs/php/getAllLocations.php",
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
            url: "libs/php/getPersonnelByID.php",
            type: "GET",
            dataType: "json",
            data: { id }
        });
    },
    getDepartmentById(id) {
        return $.ajax({
            url: "libs/php/getDepartmentByID.php",
            type: "GET",
            dataType: "json",
            data: { id }
        });
    },
};