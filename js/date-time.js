(function () {
    "use strict";

    // Declare required dependencies
    const jalaali = window.jalaali; // Assuming jalaali library is available globally
    const $ = window.$; // Assuming jQuery is available globally
    const showNotification = window.showNotification; // Assuming showNotification function is available globally

    // Check if required dependencies are available
    if (typeof jalaali === "undefined") {
        console.error("jalaali library is required but not found");
        return;
    }

    if (typeof $ === "undefined") {
        console.error("jQuery is required but not found");
        return;
    }

    // Jalali Calendar Configuration
    const jalaliMonths = [
        "فروردین",
        "اردیبهشت",
        "خرداد",
        "تیر",
        "مرداد",
        "شهریور",
        "مهر",
        "آبان",
        "آذر",
        "دی",
        "بهمن",
        "اسفند",
    ];

    // Simple Jalali Date Class
    class JalaliDate {
        constructor(jy = null, jm = null, jd = null) {
            if (jy === null) {
                const now = new Date();
                const jalali = jalaali.toJalaali(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    now.getDate()
                );
                this.jy = jalali.jy;
                this.jm = jalali.jm;
                this.jd = jalali.jd;
            } else {
                this.jy = jy;
                this.jm = jm;
                this.jd = jd;
            }
        }

        year() {
            return this.jy;
        }
        month() {
            return this.jm;
        }
        date() {
            return this.jd;
        }

        clone() {
            return new JalaliDate(this.jy, this.jm, this.jd);
        }

        subtract(amount, unit) {
            if (unit === "day") {
                const gregorian = jalaali.toGregorian(
                    this.jy,
                    this.jm,
                    this.jd
                );
                const date = new Date(
                    gregorian.gy,
                    gregorian.gm - 1,
                    gregorian.gd
                );
                date.setDate(date.getDate() - amount);
                const jalali = jalaali.toJalaali(
                    date.getFullYear(),
                    date.getMonth() + 1,
                    date.getDate()
                );
                return new JalaliDate(jalali.jy, jalali.jm, jalali.jd);
            }
            return this;
        }

        add(amount, unit) {
            if (unit === "month") {
                let newMonth = this.jm + amount;
                let newYear = this.jy;

                while (newMonth > 12) {
                    newMonth -= 12;
                    newYear++;
                }
                while (newMonth < 1) {
                    newMonth += 12;
                    newYear--;
                }

                const daysInNewMonth = this.getDaysInMonth(newYear, newMonth);
                const newDay = Math.min(this.jd, daysInNewMonth);

                this.jy = newYear;
                this.jm = newMonth;
                this.jd = newDay;
            }
            return this;
        }

        getDaysInMonth(year, month) {
            if (month <= 6) return 31;
            if (month <= 11) return 30;
            return jalaali.isLeapJalaaliYear(year) ? 30 : 29;
        }

        getFirstDayOfMonth() {
            const gregorian = jalaali.toGregorian(this.jy, this.jm, 1);
            const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
            return (date.getDay() + 1) % 7;
        }

        isSame(other) {
            return (
                this.jy === other.jy &&
                this.jm === other.jm &&
                this.jd === other.jd
            );
        }

        isAfter(other) {
            if (this.jy > other.jy) return true;
            if (this.jy < other.jy) return false;
            if (this.jm > other.jm) return true;
            if (this.jm < other.jm) return false;
            return this.jd > other.jd;
        }

        isBefore(other) {
            if (this.jy < other.jy) return true;
            if (this.jy > other.jy) return false;
            if (this.jm < other.jm) return true;
            if (this.jm > other.jm) return false;
            return this.jd < other.jd;
        }

        format() {
            return `${this.jy}/${this.jm}/${this.jd}`;
        }
    }

    // Private variables
    let dtSelectedDate = null;
    let dtSelectedTime = { hour: 12, minute: 0 };
    let dtCurrentCalendarDate = new JalaliDate();
    let dtCurrentView = "days"; // 'days', 'months', 'years'
    let dtYearSelectorStartYear =
        Math.floor(dtCurrentCalendarDate.year() / 12) * 12;

    // Create our own calendar modal to avoid conflicts
    let $dtCalendarModal = null;
    let isInitialized = false;

    // Initialize when document is ready
    $(document).ready(function () {
        initializeDateTimePicker();
    });

    function initializeDateTimePicker() {
        if (isInitialized) return;

        createCalendarModal();
        bindEvents();
        initializeTimeScrollers();
        setCurrentTime();

        isInitialized = true;
    }

    function createCalendarModal() {
        // Create a unique calendar modal for date-time picker with month/year selectors
        const modalHtml = `
            <div class="dt-calendar-modal" id="dtCalendarModal" style="display: none;">
                <div class="calendar-container">
                    <div class="calendar-header">
                        <button class="calendar-nav-btn" id="dtPrevMonth">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <div class="calendar-title">
                            <span id="dtCurrentMonth" class="clickable-title"></span>
                            <span id="dtCurrentYear" class="clickable-title"></span>
                        </div>
                        <button class="calendar-nav-btn" id="dtNextMonth">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                    </div>

                    <!-- Month Selector -->
                    <div class="dt-month-selector" id="dtMonthSelector" style="display: none;">
                        <div class="month-selector-header">
                            <div class="month-selector-title">انتخاب ماه</div>
                        </div>
                        <div class="month-selector-grid" id="dtMonthGrid"></div>
                    </div>

                    <!-- Year Selector -->
                    <div class="dt-year-selector" id="dtYearSelector" style="display: none;">
                        <div class="year-selector-header">
                            <button class="calendar-nav-btn" id="dtPrevYearPage">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                            <div class="year-selector-title" id="dtYearRangeDisplay"></div>
                            <button class="calendar-nav-btn" id="dtNextYearPage">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                        </div>
                        <div class="year-selector-grid" id="dtYearGrid"></div>
                    </div>

                    <div class="calendar-weekdays" id="dtCalendarWeekdays">
                        <div class="weekday">ش</div>
                        <div class="weekday">ی</div>
                        <div class="weekday">د</div>
                        <div class="weekday">س</div>
                        <div class="weekday">چ</div>
                        <div class="weekday">پ</div>
                        <div class="weekday">ج</div>
                    </div>

                    <div class="calendar-days" id="dtCalendarDays"></div>

                    <div class="calendar-actions">
                        <button class="calendar-reset-btn" id="dtCalendarResetBtn">
                            <i class="fas fa-times"></i>
                            <span>پاک کردن</span>
                        </button>
                        <button class="calendar-close-btn" id="dtCalendarCloseBtn">
                            <i class="fas fa-check"></i>
                            <span>تایید</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        $("body").append(modalHtml);
        $dtCalendarModal = $("#dtCalendarModal");

        // Add CSS for our modal
        // const css = `
        //     <style>
        //     .dt-calendar-modal {
        //         position: fixed;
        //         top: 0;
        //         left: 0;
        //         width: 100%;
        //         height: 100%;
        //         background: rgba(0, 0, 0, 0.5);
        //         display: flex;
        //         align-items: center;
        //         justify-content: center;
        //         z-index: 9999;
        //     }
        //     .dt-calendar-modal .calendar-container {
        //         background: white;
        //         border-radius: 8px;
        //         padding: 20px;
        //         box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        //         max-width: 350px;
        //         width: 90%;
        //         min-height: 400px;
        //     }
        //     .dt-calendar-modal .clickable-title {
        //         cursor: pointer;
        //         padding: 4px 8px;
        //         border-radius: 4px;
        //         transition: background-color 0.2s;
        //     }
        //     .dt-calendar-modal .clickable-title:hover {
        //         background-color: #f0f0f0;
        //     }
        //     .dt-calendar-modal .dt-month-selector,
        //     .dt-calendar-modal .dt-year-selector {
        //         margin: 10px 0;
        //     }
        //     .dt-calendar-modal .month-selector-grid,
        //     .dt-calendar-modal .year-selector-grid {
        //         display: grid;
        //         grid-template-columns: repeat(3, 1fr);
        //         gap: 8px;
        //         margin-top: 10px;
        //     }
        //     .dt-calendar-modal .month-item,
        //     .dt-calendar-modal .year-item {
        //         padding: 10px;
        //         text-align: center;
        //         border: 1px solid #ddd;
        //         border-radius: 4px;
        //         cursor: pointer;
        //         transition: all 0.2s;
        //     }
        //     .dt-calendar-modal .month-item:hover,
        //     .dt-calendar-modal .year-item:hover {
        //         background-color: #e3f2fd;
        //         border-color: #2196f3;
        //     }
        //     .dt-calendar-modal .month-item.selected,
        //     .dt-calendar-modal .year-item.selected {
        //         background-color: #2196f3;
        //         color: white;
        //         border-color: #2196f3;
        //     }
        //     .dt-calendar-modal .year-selector-header {
        //         display: flex;
        //         justify-content: space-between;
        //         align-items: center;
        //         margin-bottom: 10px;
        //     }
        //     .dt-calendar-modal .month-selector-header {
        //         text-align: center;
        //         margin-bottom: 10px;
        //         font-weight: bold;
        //     }
        //     </style>
        // `;
        // $('head').append(css);
    }

    function bindEvents() {
        // Bind to orderDate input specifically
        $("#orderDate").on("click", openCalendarModal);
        $("#orderTime").on("click", openTimeModal);

        // Calendar navigation
        $("#dtPrevMonth").on("click", () => navigateMonth(-1));
        $("#dtNextMonth").on("click", () => navigateMonth(1));
        $("#dtCalendarResetBtn").on("click", resetDate);
        $("#dtCalendarCloseBtn").on("click", closeCalendarModal);

        // Month and Year selector events
        $("#dtCurrentMonth").on("click", toggleMonthSelector);
        $("#dtCurrentYear").on("click", toggleYearSelector);
        $("#dtPrevYearPage").on("click", () => navigateYearPage(-1));
        $("#dtNextYearPage").on("click", () => navigateYearPage(1));

        // Time modal events
        $("#closeTimeBtn").on("click", closeTimeModal);
        $("#clearTimeBtn").on("click", clearTime);
        $("#confirmTimeBtn").on("click", confirmTime);

        // Close modal when clicking outside
        $dtCalendarModal.on("click", function (e) {
            if ($(e.target).is($dtCalendarModal)) {
                closeCalendarModal();
            }
        });

        // Escape key
        $(document).on("keydown", function (e) {
            if (e.key === "Escape" && $dtCalendarModal.is(":visible")) {
                if (dtCurrentView === "months") {
                    toggleMonthSelector();
                } else if (dtCurrentView === "years") {
                    toggleYearSelector();
                } else {
                    closeCalendarModal();
                }
            }
        });
    }

    function openCalendarModal() {
        if (dtSelectedDate) {
            dtCurrentCalendarDate = dtSelectedDate.clone();
        } else {
            dtCurrentCalendarDate = new JalaliDate();
        }

        dtCurrentView = "days";
        dtYearSelectorStartYear =
            Math.floor(dtCurrentCalendarDate.year() / 12) * 12;
        updateCalendarDisplay();
        $dtCalendarModal.addClass("d-flex").show();
        $("body").css("overflow", "hidden");
    }

    function closeCalendarModal() {
        $dtCalendarModal.removeClass("d-flex").hide();

        $("body").css("overflow", "");
        dtCurrentView = "days";
    }

    function navigateMonth(direction) {
        if (dtCurrentView !== "days") return;
        dtCurrentCalendarDate.add(direction, "month");
        updateCalendarDisplay();
    }

    function updateCalendarDisplay() {
        $("#dtCurrentMonth").text(
            jalaliMonths[dtCurrentCalendarDate.month() - 1]
        );
        $("#dtCurrentYear").text(dtCurrentCalendarDate.year());

        // Hide all sections first
        $("#dtMonthSelector").hide();
        $("#dtYearSelector").hide();
        $("#dtCalendarWeekdays").hide();
        $("#dtCalendarDays").hide();

        // Show only the current view section
        switch (dtCurrentView) {
            case "days":
                $("#dtCalendarWeekdays").show();
                $("#dtCalendarDays").show();
                renderCalendarDays();
                break;
            case "months":
                $("#dtMonthSelector").show();
                renderMonthSelector();
                break;
            case "years":
                $("#dtYearSelector").show();
                renderYearSelector();
                break;
        }
    }

    function renderCalendarDays() {
        const $calendarDays = $("#dtCalendarDays");
        $calendarDays.empty();

        const year = dtCurrentCalendarDate.year();
        const month = dtCurrentCalendarDate.month();
        const firstDay = new JalaliDate(year, month, 1);
        const startDayOfWeek = firstDay.getFirstDayOfMonth();
        const daysInMonth = firstDay.getDaysInMonth(year, month);
        const today = new JalaliDate();

        // Add empty cells for days before month starts
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDay = $("<div>").addClass("calendar-day other-month");
            $calendarDays.append(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new JalaliDate(year, month, day);
            const dayElement = $("<div>").addClass("calendar-day").text(day);

            if (dtSelectedDate && dayDate.isSame(dtSelectedDate)) {
                dayElement.addClass("selected");
            }

            if (dayDate.isSame(today)) {
                dayElement.addClass("today");
            }

            // NO CONSTRAINTS - Allow all dates
            dayElement.on("click", function () {
                selectDate(new JalaliDate(year, month, day));
            });

            $calendarDays.append(dayElement);
        }
    }

    // Month selector functions
    function toggleMonthSelector() {
        dtCurrentView = dtCurrentView === "months" ? "days" : "months";
        updateCalendarDisplay();
    }

    function renderMonthSelector() {
        const $monthGrid = $("#dtMonthGrid");
        $monthGrid.empty();

        jalaliMonths.forEach((monthName, index) => {
            const monthElement = $("<div>")
                .addClass("month-item")
                .text(monthName);

            if (index + 1 === dtCurrentCalendarDate.month()) {
                monthElement.addClass("selected");
            }

            monthElement.on("click", function () {
                selectMonth(index + 1);
            });

            $monthGrid.append(monthElement);
        });
    }

    function selectMonth(month) {
        dtCurrentCalendarDate = new JalaliDate(
            dtCurrentCalendarDate.year(),
            month,
            1
        );
        dtCurrentView = "days";
        updateCalendarDisplay();
    }

    // Year selector functions
    function toggleYearSelector() {
        dtCurrentView = dtCurrentView === "years" ? "days" : "years";
        updateCalendarDisplay();
    }

    function navigateYearPage(direction) {
        dtYearSelectorStartYear += direction * 12;
        renderYearSelector();
    }

    function renderYearSelector() {
        const $yearRangeDisplay = $("#dtYearRangeDisplay");
        const $yearGrid = $("#dtYearGrid");

        $yearRangeDisplay.text(
            `${dtYearSelectorStartYear} - ${dtYearSelectorStartYear + 11}`
        );
        $yearGrid.empty();

        for (let i = 0; i < 12; i++) {
            const year = dtYearSelectorStartYear + i;
            const yearElement = $("<div>").addClass("year-item").text(year);

            if (year === dtCurrentCalendarDate.year()) {
                yearElement.addClass("selected");
            }

            yearElement.on("click", function () {
                selectYear(year);
            });

            $yearGrid.append(yearElement);
        }
    }

    function selectYear(year) {
        dtCurrentCalendarDate = new JalaliDate(
            year,
            dtCurrentCalendarDate.month(),
            1
        );
        dtCurrentView = "days";
        updateCalendarDisplay();
    }

    function selectDate(date) {
        dtSelectedDate = date;
        updateDateDisplay();
        renderCalendarDays();
        closeCalendarModal();

        // Show notification if available
        if (typeof showNotification === "function") {
            showNotification("تاریخ با موفقیت انتخاب شد!", "success");
        }
    }

    function resetDate() {
        dtSelectedDate = null;
        $("#orderDate").val("");
        renderCalendarDays();
        closeCalendarModal();
    }

    function updateDateDisplay() {
        if (dtSelectedDate) {
            $("#orderDate").val(dtSelectedDate.format());
        }
    }

    // Time functions
    function initializeTimeScrollers() {
        const $hourScroll = $("#hourScroll");
        const $minuteScroll = $("#minuteScroll");

        // Clear existing items
        $hourScroll.empty();
        $minuteScroll.empty();

        // Generate hours (00-23)
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, "0");
            const $hourItem = $(
                `<div class="time-item" data-value="${i}">${hour}</div>`
            );
            $hourScroll.append($hourItem);
        }

        // Generate minutes (00-59)
        for (let i = 0; i < 60; i++) {
            const minute = i.toString().padStart(2, "0");
            const $minuteItem = $(
                `<div class="time-item" data-value="${i}">${minute}</div>`
            );
            $minuteScroll.append($minuteItem);
        }

        // Bind time item clicks
        $(".time-item")
            .off("click.datetime")
            .on("click.datetime", function () {
                const $this = $(this);
                const value = parseInt($this.data("value"));

                if ($this.parent().is($hourScroll)) {
                    dtSelectedTime.hour = value;
                    $hourScroll.find(".time-item").removeClass("selected");
                    $this.addClass("selected");
                } else {
                    dtSelectedTime.minute = value;
                    $minuteScroll.find(".time-item").removeClass("selected");
                    $this.addClass("selected");
                }
            });
    }

    function setCurrentTime() {
        const now = new Date();
        dtSelectedTime.hour = now.getHours();
        dtSelectedTime.minute = now.getMinutes();
        updateTimeDisplay();
    }

    function openTimeModal() {
        const $timeModal = $(".timeModal");
        const $hourScroll = $("#hourScroll");
        const $minuteScroll = $("#minuteScroll");

        // Set current selections
        $hourScroll.find(".time-item").removeClass("selected");
        $minuteScroll.find(".time-item").removeClass("selected");
        $hourScroll
            .find(`[data-value="${dtSelectedTime.hour}"]`)
            .addClass("selected");
        $minuteScroll
            .find(`[data-value="${dtSelectedTime.minute}"]`)
            .addClass("selected");

        // Scroll to selected items
        setTimeout(() => {
            scrollToSelected($hourScroll, dtSelectedTime.hour);
            scrollToSelected($minuteScroll, dtSelectedTime.minute);
        }, 100);

        $timeModal.addClass("show").show();
        $("body").css("overflow", "hidden");
    }

    function closeTimeModal() {
        $(".timeModal").removeClass("show").hide();
        $("body").css("overflow", "");
    }

    function scrollToSelected($container, value) {
        const $selected = $container.find(`[data-value="${value}"]`);
        if ($selected.length) {
            const containerHeight = $container.height();
            const itemHeight = $selected.outerHeight();
            const scrollTop =
                $selected.position().top - containerHeight / 2 + itemHeight / 2;
            $container.scrollTop($container.scrollTop() + scrollTop);
        }
    }

    function clearTime() {
        dtSelectedTime = { hour: 12, minute: 0 };
        $("#orderTime").val("");
        closeTimeModal();
    }

    function confirmTime() {
        updateTimeDisplay();
        closeTimeModal();

        if (typeof showNotification === "function") {
            showNotification("زمان با موفقیت انتخاب شد!", "success");
        }
    }

    function updateTimeDisplay() {
        const timeString = `${dtSelectedTime.hour
            .toString()
            .padStart(2, "0")}:${dtSelectedTime.minute
            .toString()
            .padStart(2, "0")}`;
        $("#orderTime").val(timeString);
    }

    // Export functions for external use
    window.PersianDateTimePicker = {
        getSelectedDate: () => dtSelectedDate,
        getSelectedTime: () => dtSelectedTime,
        setDate: (jy, jm, jd) => {
            dtSelectedDate = new JalaliDate(jy, jm, jd);
            dtCurrentCalendarDate = dtSelectedDate.clone();
            updateDateDisplay();
            updateCalendarDisplay();
        },
        setTime: (hour, minute) => {
            dtSelectedTime = { hour, minute };
            updateTimeDisplay();
        },
        clearAll: () => {
            dtSelectedDate = null;
            dtSelectedTime = { hour: 12, minute: 0 };
            $("#orderDate").val("");
            $("#orderTime").val("");
        },
    };
})();
