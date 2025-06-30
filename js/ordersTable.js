const $ = window.jQuery; // Declare the $ variable before using it

$(document).ready(() => {
    // Persian number conversion function
    function toPersianNumbers(str) {
        const persianDigits = [
            "۰",
            "۱",
            "۲",
            "۳",
            "۴",
            "۵",
            "۶",
            "۷",
            "۸",
            "۹",
        ];
        return str
            .toString()
            .replace(/\d/g, (digit) => persianDigits[Number.parseInt(digit)]);
    }

    // Detect table type
    const isSingleCustomerOrders = $("#singleCustomerOrders").length > 0;
    const isOrdersTable =
        !isSingleCustomerOrders && $("#ordersTable").length > 0;
    const isCustomersTable =
        !isSingleCustomerOrders &&
        !isOrdersTable &&
        $("#customersTable").length > 0;

    let detectedTable = "Unknown";
    if (isSingleCustomerOrders) {
        detectedTable = "SingleCustomerOrders";
    } else if (isOrdersTable) {
        detectedTable = "Orders";
    } else if (isCustomersTable) {
        detectedTable = "Customers";
    }

    console.log("Table detected:", detectedTable);

    // Sample orders data
    const baseOrders = [
        {
            id: 1,
            customerName: "فاطمه احمدی",
            orderDate: "۲۱ مرداد ۱۴۰۱ - ۱۲:۲۵",
            orderType: "تحویل در منزل",
            trackingId: "9348fjr73",
            orderTotal: "۲۵,۰۰۰",
            status: "تکمیل شده",
        },
        {
            id: 2,
            customerName: "علی محمدی",
            orderDate: "۲۱ مرداد ۱۴۰۱ - ۱۲:۲۵",
            orderType: "تحویل در منزل",
            trackingId: "9348fjr74",
            orderTotal: "۲۵,۰۰۰",
            status: "در حال پردازش",
        },
        {
            id: 3,
            customerName: "مریم رضایی",
            orderDate: "۲۱ مرداد ۱۴۰۱ - ۱۲:۲۵",
            orderType: "تحویل حضوری",
            trackingId: "9348fjr75",
            orderTotal: "۲۵,۰۰۰",
            status: "در انتظار",
        },
        {
            id: 4,
            customerName: "حسن کریمی",
            orderDate: "۲۱ مرداد ۱۴۰۱ - ۱۲:۲۵",
            orderType: "تحویل حضوری",
            trackingId: "9348fjr76",
            orderTotal: "۲۵,۰۰۰",
            status: "تکمیل شده",
        },
        {
            id: 5,
            customerName: "زهرا موسوی",
            orderDate: "۲۱ مرداد ۱۴۰۱ - ۱۲:۲۵",
            orderType: "تحویل حضوری",
            trackingId: "9348fjr77",
            orderTotal: "۲۵,۰۰۰",
            status: "تکمیل شده",
        },
    ];

    // Sample customers data
    const baseCustomers = [
        {
            id: 1,
            customerName: "فاطمه احمدی",
            email: "fateme.ahmadi@gmail.com",
            mobile: "۰۹۱۲۳۴۵۶۷۸۹",
            ordersCount: "۱۲",
            totalPrice: "۱,۲۵۰,۰۰۰ تومان",
            joinDate: "۱۵ فروردین ۱۴۰۱",
            status: "فعال",
        },
        {
            id: 2,
            customerName: "علی محمدی",
            email: "ali.mohammadi@yahoo.com",
            mobile: "۰۹۱۹۸۷۶۵۴۳۲",
            ordersCount: "۸",
            totalPrice: "۸۵۰,۰۰۰ تومان",
            joinDate: "۲۳ اردیبهشت ۱۴۰۱",
            status: "فعال",
        },
        {
            id: 3,
            customerName: "مریم رضایی",
            email: "maryam.rezaei@hotmail.com",
            mobile: "۰۹۳۶۱۲۳۴۵۶۷",
            ordersCount: "۵",
            totalPrice: "۴۲۰,۰۰۰ تومان",
            joinDate: "۱۰ خرداد ۱۴۰۱",
            status: "غیر فعال",
        },
        {
            id: 4,
            customerName: "حسن کریمی",
            email: "hassan.karimi@gmail.com",
            mobile: "۰۹۱۷۷۶۵۴۳۲۱",
            ordersCount: "۲۰",
            totalPrice: "۲,۱۰۰,۰۰۰ تومان",
            joinDate: "۵ تیر ۱۴۰۱",
            status: "فعال",
        },
        {
            id: 5,
            customerName: "زهرا موسوی",
            email: "zahra.mousavi@outlook.com",
            mobile: "۰۹۳۸۹۸۷۶۵۴۳",
            ordersCount: "۳",
            totalPrice: "۱۸۰,۰۰۰ تومان",
            joinDate: "۲۸ مرداد ۱۴۰۱",
            status: "فعال",
        },
    ];

    //Sample single customer orders
    const baseSingleCustomerOrders = [
        {
            id: 1,
            orderType: "تحویل در منزل",
            ordersCount: "۱۲",
            totalPrice: "۱,۲۵۰,۰۰۰ تومان",
            joinDate: "۱۵ فروردین ۱۴۰۱",
            status: "غیر فعال",
        },
        {
            id: 2,
            orderType: "تحویل حضوری",
            ordersCount: "۱۲",
            totalPrice: "۱,۲۵۰,۰۰۰ تومان",
            joinDate: "۱۵ فروردین ۱۴۰۱",
            status: "فعال",
        },
    ];

    // Generate 200 records for pagination testing
    const allData = [];
    const baseData = isSingleCustomerOrders
        ? baseSingleCustomerOrders
        : isOrdersTable
        ? baseOrders
        : baseCustomers;

    for (let i = 0; i < 200; i++) {
        const baseItem = baseData[i % baseData.length];

        if (isOrdersTable) {
            allData.push({
                ...baseItem,
                id: i + 1,
                trackingId: `9348fjr${(73 + i).toString().padStart(2, "0")}`,
                customerName:
                    baseItem.customerName + (i > 4 ? ` ${i + 1}` : ""),
            });
        } else if (isCustomersTable) {
            const randomOrderCount = Math.floor(Math.random() * 30) + 1;
            const randomTotalPrice =
                Math.floor(Math.random() * 5000000) + 100000;

            allData.push({
                ...baseItem,
                id: i + 1,
                customerName:
                    baseItem.customerName +
                    (i > 4 ? ` ${Math.floor(i / 5) + 1}` : ""),
                email: baseItem.email.replace("@", `${i + 1}@`),
                mobile:
                    baseItem.mobile.slice(0, -3) +
                    toPersianNumbers((100 + i).toString().slice(-3)),
                ordersCount: toPersianNumbers(randomOrderCount.toString()),
                totalPrice:
                    toPersianNumbers(randomTotalPrice.toLocaleString()) +
                    " تومان",
            });
        } else if (isSingleCustomerOrders) {
            const randomOrderCount = Math.floor(Math.random() * 30) + 1;
            const randomTotalPrice =
                Math.floor(Math.random() * 5000000) + 100000;

            allData.push({
                ...baseItem,
                id: i + 1,
                trackingId: `9348fjr${(73 + i).toString().padStart(2, "0")}`,
                customerName:
                    baseItem.customerName +
                    (i > 4 ? ` ${Math.floor(i / 5) + 1}` : ""),
                // email: baseItem.email.replace("@", `${i + 1}@`),
                // mobile:
                //     baseItem.mobile.slice(0, -3) +
                //     toPersianNumbers((100 + i).toString().slice(-3)),
                ordersCount: toPersianNumbers(randomOrderCount.toString()),
                totalPrice:
                    toPersianNumbers(randomTotalPrice.toLocaleString()) +
                    " تومان",
            });
        }
    }

    let currentPage = 1;
    let itemsPerPage = 10;
    let selectedRows = [];

    // Status translation mapping
    const statusTranslation = isOrdersTable
        ? {
              "تکمیل شده": "completed",
              "در حال پردازش": "in-progress",
              "در انتظار": "pending",
          }
        : {
              'فعال': "active-user",
              'غیر فعال': "inactive-user",
          };

    // Mock notification function (fallback)
    function mockNotification(message, type, options) {
        console.log(`Notification: ${message} (${type})`);
        // You can replace this with a simple alert or custom toast
        alert(message);
    }

    // Initialize table
    function initTable() {
        updateTable();
        updatePagination();
        bindEvents();
    }

    // Generate table row based on table type
    function generateTableRow(item) {
        const statusClass = statusTranslation[item.status] || "pending";
        const isChecked = selectedRows.includes(item.id) ? "checked" : "";

        if (isOrdersTable) {
            return `
                <tr class="base_order" data-id="${item.id}">
                    <td>
                        <input type="checkbox" class="form-check-input row-checkbox form-check-input-custom" data-id="${item.id}" ${isChecked}>
                    </td>
                    <td class="customer-name">${item.customerName}</td>
                    <td class="order-date">${item.orderDate}</td>
                    <td class="delivery-method">${item.orderType}</td>
                    <td class="tracking-code">
                        <div class="tracking-id">
                            <span class="tracking-code-init">${item.trackingId}</span>
                            <button class="copy_btn" data-tracking="${item.trackingId}" title="کپی کردن">
                                <i class="far fa-copy"></i>
                            </button>
                        </div>
                    </td>
                    <td class="total-price">${item.orderTotal}</td>
                    <td>
                        <div class="action-dropdown">
                            <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                ${item.status}
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item action-item" data-id="${item.id}" data-action="تکمیل شده">تکمیل شده</a></li>
                                <li><a class="dropdown-item action-item" data-id="${item.id}" data-action="در حال پردازش">در حال پردازش</a></li>
                                <li><a class="dropdown-item action-item" data-id="${item.id}" data-action="در انتظار">در انتظار</a></li>
                            </ul>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">${item.status}</span>
                    </td>
                </tr>
            `;
        } else if (isCustomersTable) {
            return `
                <tr class="customer-table" data-id="${item.id}">
                    <td>
                        <input type="checkbox" class="form-check-input row-checkbox form-check-input-custom" data-id="${item.id}" ${isChecked}>
                    </td>
                    <td class="customer-name">${item.customerName}</td>
                    <td>
                        <div class="copyable-field">
                            <span class="customer-email">${item.email}</span>
                            <button class="copy_btn" data-copy="${item.email}" title="کپی کردن ایمیل">
                                <i class="far fa-copy"></i>
                            </button>
                        </div>
                    </td>
                    <td>
                        <div class="copyable-field">
                            <span class="customer-phone">${item.mobile}</span>
                            <button class="copy_btn" data-copy="${item.mobile}" title="کپی کردن شماره موبایل">
                                <i class="far fa-copy"></i>
                            </button>
                        </div>
                    </td>
                    <td class="customer-order-count">${item.ordersCount}</td>
                    <td class="customer-order-cost">${item.totalPrice}</td>
                    <td class="customer-join-date">${item.joinDate}</td>
                    <td>
                        <div class="action-dropdown">
                            <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                ${item.status}
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item action-item" data-id="${item.id}" data-action="فعال">فعال</a></li>
                                <li><a class="dropdown-item action-item" data-id="${item.id}" data-action="غیر فعال">غیر فعال</a></li>
                            </ul>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">${item.status}</span>
                    </td>
                </tr>
            `;
        } else if (isSingleCustomerOrders) {
            return `
                <tr class="customer-table" data-id="${item.id}">
                    <td>
                        <input type="checkbox" class="form-check-input row-checkbox form-check-input-custom" data-id="${item.id}" ${isChecked}>
                    </td>
                    
                    <td class="customer-join-date">${item.joinDate}</td>
                    <td class="delivery-method">${item.orderType}</td>
                    <td class="tracking-code">
                         <div class="tracking-id">
                             <span class="tracking-code-init">${item.trackingId}</span>
                             <button class="copy_btn" data-tracking="${item.trackingId}" title="کپی کردن">
                                 <i class="far fa-copy"></i>
                             </button>
                         </div>
                     </td>
                    <td class="customer-order-cost">${item.totalPrice}</td>
                    <td>
                        <div class="action-dropdown">
                            <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                ${item.status}
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item action-item" data-id="${item.id}" data-action="فعال">فعال</a></li>
                                <li><a class="dropdown-item action-item" data-id="${item.id}" data-action="غیر فعال">غیر فعال</a></li>
                            </ul>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">${item.status}</span>
                    </td>
                </tr>
            `;
        }
    }

    // Update table content
    function updateTable() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentData = allData.slice(startIndex, endIndex);

        const tableBody = $("#tableBody");
        tableBody.empty();

        currentData.forEach((item) => {
            const row = generateTableRow(item);
            tableBody.append(row);
        });

        updateSelectAllCheckbox();
    }

    // Update pagination controls
    function updatePagination() {
        const totalPages = Math.ceil(allData.length / itemsPerPage);
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, allData.length);

        // Update items range with Persian numbers
        $("#itemsRange").text(
            `${toPersianNumbers(startItem)}-${toPersianNumbers(
                endItem
            )} از ${toPersianNumbers(allData.length)} آیتم`
        );

        // Update pages info with Persian numbers
        $("#pagesInfo").text(`از ${toPersianNumbers(totalPages)} صفحه`);

        // Update page select options
        const pageSelect = $("#pageSelect");
        pageSelect.empty();
        for (let i = 1; i <= totalPages; i++) {
            pageSelect.append(
                `<option value="${i}" ${
                    i === currentPage ? "selected" : ""
                }>${toPersianNumbers(i)}</option>`
            );
        }

        // Update navigation buttons (note: in RTL, next/prev are swapped)
        $("#prevBtn").prop("disabled", currentPage === totalPages);
        $("#nextBtn").prop("disabled", currentPage === 1);
    }

    // Update select all checkbox state
    function updateSelectAllCheckbox() {
        const currentPageIds = [];
        $("#tableBody tr").each(function () {
            currentPageIds.push(Number.parseInt($(this).data("id")));
        });

        const allCurrentSelected = currentPageIds.every((id) =>
            selectedRows.includes(id)
        );
        const someCurrentSelected = currentPageIds.some((id) =>
            selectedRows.includes(id)
        );

        const selectAllCheckbox = $("#selectAll");
        selectAllCheckbox.prop("checked", allCurrentSelected);
        selectAllCheckbox.prop(
            "indeterminate",
            someCurrentSelected && !allCurrentSelected
        );
    }

    // Bind events
    function bindEvents() {
        // Items per page change
        $("#itemsPerPage").on("change", function () {
            itemsPerPage = Number.parseInt($(this).val());
            currentPage = 1;
            updateTable();
            updatePagination();
        });

        // Page select change
        $("#pageSelect").on("change", function () {
            currentPage = Number.parseInt($(this).val());
            updateTable();
            updatePagination();
        });

        // Previous/Next buttons (swapped for RTL)
        $("#prevBtn").on("click", () => {
            const totalPages = Math.ceil(allData.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                updateTable();
                updatePagination();
            }
        });

        $("#nextBtn").on("click", () => {
            if (currentPage > 1) {
                currentPage--;
                updateTable();
                updatePagination();
            }
        });

        // Select all checkbox
        $("#selectAll").on("change", function () {
            const isChecked = $(this).is(":checked");
            const currentPageIds = [];

            $("#tableBody tr").each(function () {
                currentPageIds.push(Number.parseInt($(this).data("id")));
            });

            if (isChecked) {
                currentPageIds.forEach((id) => {
                    if (!selectedRows.includes(id)) {
                        selectedRows.push(id);
                    }
                });
            } else {
                selectedRows = selectedRows.filter(
                    (id) => !currentPageIds.includes(id)
                );
            }

            $(".row-checkbox").prop("checked", isChecked);
        });

        // Individual row checkboxes
        $(document).on("change", ".row-checkbox", function () {
            const id = Number.parseInt($(this).data("id"));
            const isChecked = $(this).is(":checked");

            if (isChecked) {
                if (!selectedRows.includes(id)) {
                    selectedRows.push(id);
                }
            } else {
                selectedRows = selectedRows.filter((rowId) => rowId !== id);
            }

            updateSelectAllCheckbox();
        });

        // Action dropdown items
        $(document).on("click", ".action-item", function (e) {
            e.preventDefault();
            const itemId = Number.parseInt($(this).data("id"));
            const newStatus = $(this).data("action");

            // Update the item in allData array
            const itemIndex = allData.findIndex((item) => item.id === itemId);
            if (itemIndex !== -1) {
                allData[itemIndex].status = newStatus;
            }

            // Update the table display
            updateTable();
        });
    }

    // Copy functionality with your notification system
    $(document).on("click", ".copy_btn", function () {
        const trackingId = $(this).data("tracking") || $(this).data("copy");

        // Copy to clipboard
        const $temp = $("<textarea>");
        $("body").append($temp);
        $temp.val(trackingId).select();
        document.execCommand("copy");
        $temp.remove();

        // Determine message based on context
        let message;
        if ($(this).data("tracking")) {
            message = "کد پیگیری با موفقیت کپی شد";
        } else if ($(this).data("copy")) {
            const copyText = $(this).data("copy");
            if (copyText.includes("@")) {
                message = "ایمیل با موفقیت کپی شد";
            } else {
                message = "شماره موبایل با موفقیت کپی شد";
            }
        } else {
            message = "اطلاعات با موفقیت کپی شد";
        }

        // Use your custom notification system or fallback
        if (typeof window.showNotification === "function") {
            window.showNotification(message, "success", {
                showDates: false,
            });
        } else {
            // Fallback notification
            mockNotification(message, "success", { showDates: false });
        }
    });

    // Initialize the table
    initTable();
});
