$(document).ready(function () {
    // MENU ITEM (PARENT , CHILD , GRAND CHILD) ACTIVATION LEVEL ,  HANDELING OF MENU OPENING WITH CLICKING
    $(".navigation_box-list").on(
        "click",
        ".navigation_box-list-item-inner, .children-item-inner, .childBox-item-inner",
        function (e) {
            // e.preventDefault();

            // اگر هدر در حالت آپدیت باشد و آیتم کلیک شده والد باشد، تغییر نکند
            if ($("#header").hasClass("header_update")) {
                var $item = $(this).closest(
                    ".navigation_box-list-item, .children-item, .childBox-item"
                );
                if (
                    $item.hasClass("navigation_box-list-item") &&
                    $item.is(".active, .semi-active, .quarter-active")
                ) {
                    return;
                }
            }

            var $this = $(this);
            var $item = $this.closest(
                ".navigation_box-list-item, .children-item, .childBox-item"
            );

            var isParent = $item.hasClass("navigation_box-list-item");
            var isChild = $item.hasClass("children-item");
            var isGrandchild = $item.hasClass("childBox-item");

            if (isParent) {
                handleParentClick($item, $this);
            } else if (isChild) {
                handleChildClick($item, $this);
            } else if (isGrandchild) {
                handleGrandchildClick($item, $this);
            }
        }
    );

    function handleParentClick($parent, $this) {
        var isActive = $parent.is(".active, .semi-active, .quarter-active");

        if (isActive) {
            $parent
                .removeClass("active semi-active quarter-active opennig_class")
                .find(".children-item, .childBox-item")
                .removeClass("active semi-active quarter-active opennig_class")
                .end()
                .find(".rotated")
                .removeClass("rotated");
        } else {
            $(".navigation_box-list-item, .children-item, .childBox-item")
                .removeClass("active semi-active quarter-active opennig_class")
                .find(".rotated")
                .removeClass("rotated");

            $parent.addClass("active opennig_class");
            $this.addClass("rotated");
        }
    }

    function handleChildClick($child, $this) {
        var isActive = $child.hasClass("active");

        if (isActive) {
            $child
                .add($child.find(".childBox-item"))
                .removeClass("active semi-active opennig_class")
                .find(".rotated")
                .removeClass("rotated");

            var $parent = $child.closest(".navigation_box-list-item");
            $parent.removeClass("semi-active").addClass("active");
        } else {
            $(".children-item, .childBox-item")
                .removeClass("active semi-active opennig_class")
                .find(".rotated")
                .removeClass("rotated");

            $child.addClass("active opennig_class");
            $this.addClass("rotated");

            var $parent = $child.closest(".navigation_box-list-item");
            $parent.removeClass("active").addClass("semi-active");
        }
    }

    function handleGrandchildClick($grandchild, $this) {
        var isActive = $grandchild.hasClass("active");

        if (isActive) {
            $grandchild
                .removeClass("active opennig_class")
                .find(".rotated")
                .removeClass("rotated");

            var $child = $grandchild.closest(".children-item");
            $child.removeClass("semi-active").addClass("active");

            var $parent = $child.closest(".navigation_box-list-item");
            $parent.removeClass("quarter-active").addClass("semi-active");
        } else {
            $(".childBox-item")
                .removeClass("active opennig_class")
                .find(".rotated")
                .removeClass("rotated");

            $grandchild.addClass("active opennig_class");
            $this.addClass("rotated");

            var $child = $grandchild.closest(".children-item");
            $child.removeClass("active").addClass("semi-active");

            var $parent = $child.closest(".navigation_box-list-item");
            $parent.removeClass("semi-active").addClass("quarter-active");
        }
    }

    // HANDELING THE OPENNING AND CLOSING OF THE SIDE MENU , HEADER

    $("#oppening_button").on("click", function () {
        $("#header").removeClass("header_update");
        $("#main").removeClass("main_update");
    });

    $("#closing_button").on("click", function () {
        $("#header").addClass("header_update");
        $("#main").addClass("main_update");
    });

    $("#header").on("click", "*", function (e) {
        if (!$(e.target).is("#oppening_button, #closing_button *")) {
            $("#header").removeClass("header_update");
            $("#main").removeClass("main_update");
        }
    });

    $(".mobile_menu_opennig").on("click", function () {
        setTimeout(function () {
            $("header").css("right", "0"); // اگر هدر تگ <header> است
        }, 1);
        $("header").removeClass("header_update");
        $("main").removeClass("main_update");
    });

    $(".mobile_menu_closing").on("click", function () {
        setTimeout(function () {
            $("#header").addClass("header_update");
            $("#main").addClass("main_update");
        }, 300);
        $("#header").css("right", ""); // اگر هدر تگ <header> است
    });

    // THE CUSTOM SELECT OPTION
    $(".custom-select").each(function () {
        const $select = $(this);
        const $selected = $select.find(".selected-value");
        const $options = $select.find(".option");

        $select.on("click", function (e) {
            e.stopPropagation();
            $select.toggleClass("open");
        });

        $options.on("click", function (e) {
            e.stopPropagation();
            const $option = $(this);

            // Update selected value
            $selected.text($option.text());
            $select.prev().val($option.data("value"));
            $options.removeClass("active");
            $option.addClass("active");

            // Close menu with delay
            clearTimeout($select.data("close-timeout")); // Clear existing timeout
            const timeoutId = setTimeout(() => {
                $select.removeClass("open");
            }, 300);
            $select.data("close-timeout", timeoutId); // Store timeout ID on the element
        });
    });

    // Close menu immediately when clicking outside
    $(document).on("click", function (e) {
        $(".custom-select").each(function () {
            const $select = $(this);
            clearTimeout($select.data("close-timeout")); // Clear timeout for each select
            $select.removeClass("open");
        });
    });

    //   THE DONUT CHART
    $(document).ready(function () {
        // ایجاد چارت
        const ctx = $("#donut_chart")[0].getContext("2d");
        const myChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["سود", "خرید", "ظبط"],
                datasets: [
                    // Background Ring (gray full ring)
                    {
                        data: [100],
                        backgroundColor: ["#EEF0FA"],
                        borderWidth: 0,
                        cutout: "50%",
                        circumference: 360,
                        rotation: 0,
                        weight: 1,
                        tooltip: { enabled: false },
                    },
                    // Foreground Ring (actual data)
                    {
                        data: [50, 30, 20],
                        backgroundColor: ["#5570F1", "#97A5EB", "#FFCC91"],
                        borderWidth: 0,
                        cutout: "50%",
                        circumference: 360,
                        rotation: 0,
                        weight: 1.3,
                    },
                    {
                        data: [100],
                        backgroundColor: ["#EEF0FA"],
                        borderWidth: 0,
                        cutout: "50%",
                        circumference: 360,
                        rotation: 0,
                        weight: 0.9,
                        tooltip: { enabled: false },
                    },
                ],
            },
            options: {
                responsive: true,

                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        filter: (tooltipItem) => tooltipItem.datasetIndex === 1,
                        bodyAlign: "right", // Text alignment
                        titleAlign: "right", // Title alignment
                        bodyFont: {
                            family: "IransansXV",
                            size: 12,
                        },
                        titleFont: {
                            family: "IransansXV",
                        },
                        footerFont: {
                            family: "IransansXV",
                        },

                        callbacks: {
                            label: function (context) {
                                const dataset = context.dataset;
                                const total = dataset.data.reduce(
                                    (a, b) => a + b,
                                    0
                                );
                                const value = context.raw;
                                const percentage =
                                    ((value / total) * 100).toFixed(1) + "%";
                                return `${context.label}: ${percentage}`;
                            },
                        },
                    },
                },
            },
        });

        // ایجاد لیجند سفارشی با قابلیت کلیک
        function createCustomLegend(chart, legendContainer) {
            const ul = document.createElement("div");
            ul.className = "legend";

            const dataset = chart.data.datasets[1];
            const labels = chart.data.labels;

            labels.forEach((label, i) => {
                const li = document.createElement("div");
                li.className = "legend_item";
                li.dataset.index = i;

                const colorBox = document.createElement("div");
                colorBox.className = "legend_color";
                colorBox.style.backgroundColor = dataset.backgroundColor[i];

                const text = document.createTextNode(label);

                li.appendChild(colorBox);
                li.appendChild(text);
                ul.appendChild(li);

                // اضافه کردن رویداد کلیک
                li.addEventListener("click", function () {
                    const meta = chart.getDatasetMeta(1);
                    const index = parseInt(this.dataset.index);

                    meta.data[index].hidden = !meta.data[index].hidden;
                    this.classList.toggle("hidden");

                    chart.update();
                });
            });

            legendContainer.innerHTML = "";
            legendContainer.appendChild(ul);
        }

        // فراخوانی تابع برای ساخت لیجند
        const legendContainer = document.querySelector(".legend-container");
        createCustomLegend(myChart, legendContainer);
    });

    //  THE BAR CHART
    $(document).ready(function () {
        const labels = [
            "Sept 10",
            "Sept 11",
            "Sept 12",
            "Sept 13",
            "Sept 14",
            "Sept 15",
            "Sept 16",
        ];
        const maxValue = 100000;
        const actual = [90000, 40000, 65000, 20000, 85000, 50000, 82000];

        const data = {
            labels,
            datasets: [
                // Gray bars (actual) as the background layer
                {
                    data: actual, // Original values (e.g., 90k, 40k)
                    backgroundColor: "#4e5cf1", // Blue color
                    borderRadius: {
                        topLeft: 10,
                        topRight: 10,
                        bottomLeft: 10,
                        bottomRight: 10,
                    },
                    borderWidth: 0,
                    borderSkipped: false,
                    barThickness: 10,
                    categoryPercentage: 0.6,
                    barPercentage: 1.0,
                },
                {
                    data: labels.map(() => maxValue), // Use maxValue to fill the full height
                    backgroundColor: "rgba(229, 231, 255, 0.5)", // Gray color
                    borderRadius: {
                        topLeft: 10,
                        topRight: 10,
                        bottomLeft: 10,
                        bottomRight: 10,
                    },
                    borderWidth: 0,
                    borderSkipped: false,
                    barThickness: 10,
                    categoryPercentage: 0,
                    barPercentage: 0,
                },
                // Blue bars (now the "actual" data) on top
            ],
        };
        const config = {
            type: "bar",
            data,
            options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            display: false,
                            drawBorder: false,
                        },
                        border: {
                            display: false,
                        },
                        ticks: {
                            color: "#BEC0CA",
                            font: { size: 12 },
                            tickLength: 0,
                            padding: 20,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        max: maxValue,
                        // stacked: true,
                        grid: {
                            display: false,
                            drawBorder: false,
                        },
                        border: {
                            display: false,
                        },
                        ticks: {
                            stepSize: 25000,
                            callback: (v) => v / 1000 + "k",
                            color: "#A6A8B1",
                            font: { size: 12 },
                            tickLength: 0,
                        },
                    },
                },
            },
        };

        new Chart(document.getElementById("salesChart"), config);
    });

    // ORDERS FILTER
   $(document).ready(function () {
    const $searchInput = $(".orders_search_container-search-input");

    // جستجو در سفارش‌ها
    $searchInput.on("input", function () {
        const searchText = $(this).val().toLowerCase().trim();

        $(".base_order").each(function () {
            const $order = $(this);
            const content = [
                $order.find(".customer-name").text(),
                $order.find(".order-date").text(),
                $order.find(".delivery-method").text(),
                $order.find(".tracking-code-init").text(),
                $order.find(".total-price").text(),
                $order.find(".status-badge").text(),
            ]
                .join(" ")
                .toLowerCase();

            $order.toggle(content.includes(searchText));
        });
    });

    // افزودن/حذف کلاس focused هنگام فوکوس و بلور
    $searchInput
        .on("focus", function () {
            $(this).closest(".orders_search_container").addClass("focused");
        })
        .on("blur", function () {
            $(this).closest(".orders_search_container").removeClass("focused");
        });
});


    // OPENING FILTERS
    let filtersVisible = false; // state flag

    $(".open_filters_box_btn").on("click", function () {
        const $target = $(
            ".orders_functional_box_inner-top-filtersBox-filters"
        );

        if (!filtersVisible) {
            // Show the filters
            $target.removeClass("filters_display");

            setTimeout(function () {
                $target.addClass("filters_show");
            }, 100);

            filtersVisible = true;
        } else {
            // Hide the filters

            $target.removeClass("filters_show");

            setTimeout(function () {
                $target.addClass("filters_display");
            }, 250); // Adjust this delay to match any transition duration

            filtersVisible = false;
        }
    });
});
