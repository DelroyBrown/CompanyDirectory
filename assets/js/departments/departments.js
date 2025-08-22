import { API } from "../api.js";

export function loadDepartments(q = "", filters = {}) {
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
            <td class="align-middle text-nowrap">
                <a href="#" class="department-link" data-id="${dept.id}" data-name="${dept.department}">
                ${dept.department}
                </a>
            </td>
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




// -------------------------Department Members Modal ------------------------------------
(function ensureDepartmentPeopleModal() {
    if (document.getElementById("departmentPeopleModal")) return;
    const modalHtml = `
  <div class="modal fade" id="departmentPeopleModal" tabindex="-1" aria-labelledby="departmentPeopleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="departmentPeopleModalLabel">Department Members</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div id="departmentPeopleLoading" class="text-center py-4">Loading…</div>
          <div id="departmentPeopleEmpty" class="alert alert-info d-none">No people found in this department.</div>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th class="text-nowrap">Name</th>
                  <th class="text-nowrap">Job Title</th>
                  <th class="text-nowrap d-none d-md-table-cell">Email</th>
                  <th class="text-nowrap d-none d-md-table-cell">Location</th>
                </tr>
              </thead>
              <tbody id="departmentPeopleTableBody"></tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <span id="departmentPeopleCount" class="me-auto small text-muted"></span>
          <button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">CLOSE</button>
        </div>
      </div>
    </div>
  </div>`;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
})();

function showDeptModal() {
    const el = document.getElementById("departmentPeopleModal");
    if (window.bootstrap && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(el).show();
    } else if (typeof $ === "function" && typeof $("#departmentPeopleModal").modal === "function") {
        $("#departmentPeopleModal").modal("show");
    } else {
        el.classList.add("show");
        el.style.display = "block";
        el.removeAttribute("aria-hidden");
    }
}

// bind at document level so container IDs don't matter
$(document)
    .off("click", "a.department-link")
    .on("click", "a.department-link", function (e) {
        e.preventDefault();

        const $a = $(this);
        const deptId = String($a.data("id"));
        const deptName = String($a.data("name") || "Department");

        // Prepare modal UI
        $("#departmentPeopleModalLabel").text(`${deptName} — Members`);
        $("#departmentPeopleTableBody").empty();
        $("#departmentPeopleEmpty").addClass("d-none").text("No people found in this department.");
        $("#departmentPeopleCount").text("");
        $("#departmentPeopleLoading").removeClass("d-none");

        showDeptModal();

        // Fetch people for this department
        $.ajax({
            url: "libs/php/getAll.php",
            type: "GET",
            dataType: "json",
            data: { departmentID: deptId }
        })
            .done(function (res) {
                $("#departmentPeopleLoading").addClass("d-none");

                const items = Array.isArray(res && res.data) ? res.data : [];
                if (items.length === 0) {
                    $("#departmentPeopleEmpty").removeClass("d-none");
                    $("#departmentPeopleCount").text("0 people");
                    return;
                }

                const rowsHtml = items.map(p => {
                    const first = safe(p.firstName ?? p.firstname ?? "");
                    const last = safe(p.lastName ?? p.lastname ?? "");
                    const job = safe(p.jobTitle ?? p.jobtitle ?? "");
                    const email = safe(p.email ?? p.emailAddress ?? "");
                    const loc = safe(p.location ?? p.locationName ?? "");
                    const fullName = (last || first) ? `${last}${last && first ? ", " : ""}${first}` : "(No name)";
                    return `
            <tr>
              <td class="align-middle text-nowrap">${fullName}</td>
              <td class="align-middle text-nowrap">${job}</td>
              <td class="align-middle text-nowrap d-none d-md-table-cell">${email}</td>
              <td class="align-middle text-nowrap d-none d-md-table-cell">${loc}</td>
            </tr>`;
                }).join("");

                $("#departmentPeopleTableBody").html(rowsHtml);
                $("#departmentPeopleCount").text(`${items.length} ${items.length === 1 ? "person" : "people"}`);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error("Load department members failed:", textStatus, errorThrown);
                $("#departmentPeopleLoading").addClass("d-none");
                $("#departmentPeopleEmpty").removeClass("d-none").text("Sorry, couldn’t load department members.");
            });
    });

function safe(val) {
    return String(val ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
