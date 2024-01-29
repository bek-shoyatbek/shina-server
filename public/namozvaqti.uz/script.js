const AD_API = "https://kolesso.uz";

document.addEventListener("DOMContentLoaded", async () => {


    let today = new Date().getDate();
    const popupTimer = localStorage.getItem("popupShown");

    const body = document.querySelector("body");
    const adHeader = document.getElementById("ads");
    const popper = document.getElementById("popper");

    const ads = await getAds();

    let header;
    let popup;
    ads.forEach((e) => {
        if (e.location == "header") {
            header = e;
        }
        if (e.location == "popup") {
            popup = e;
        }
    });
    if (!header) {
        body.removeChild(adHeader);
    }

    if (header) {
        const result = await handleIncrement(header._id, "seen");
    }
    // Show the popup only once per day and not when it was already shown before
    if (popup && !popupTimer) {
        const result = await handleIncrement(popup._id, "seen");
    }

    console.log('Header ', header);
    console.log('Popup ', popup);

    if (header) {
        const headerHtml = `
        <a href="${header.link}" id="header_${header._id}" target="_blank">
        <div id="ad_text">
        <h2>${header.name}</h2>
        </div>
        <img src="${AD_API + "/images/" + header.image}" id="ads_img">
        </a>  
        `;

        adHeader.innerHTML = headerHtml;
    }
    if (popup) {
        const popperHtml = `
    <div class="modal-content">
    <a href="${popup.link}" target="_blank" id="popup-link_${popup._id}">
    <img src="${AD_API + "/" + popup.image}" alt="Image" /></a>
    <button id="btn" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
    </div>`;

        popper.innerHTML = popperHtml;


        function closeModal() {
            popper.style.display = "none";
        }

        if (popupTimer !== today.toString()) {
            popper.style.display = "block";
            const btn = document.getElementById("btn");
            btn.style.display = 'none';
            // show modal after 3 seconds
            setTimeout(function () {
                btn.style.display = "block";
            }, 3000);

            // Hide modal after 6 seconds
            setTimeout(function () {
                modal.style.display = "none";
            }, 6000);
            localStorage.setItem("popupShown", today.toString());

        }
    } else {
        popper.style.display = "none";
        body.removeChild(popper);

    }



    // const popupHtml = `
    //     <a href="${popup.link}" id="popup-link_${popup._id}" style="width:90%;height:90%;" target="_blank">
    //       <img style="width:90%;height:90%;" src="${AD_API + "/images/" + popup.image
    //     }">
    //          <h1>${popup.name}</h1>
    //     </a>
    //   `;
    // console.log(`Popup timer ${popupTimer}`, `Today ${today.toString()}`);
    // if (popupTimer !== today.toString()) {
    //     console.log("Popup is being showed....");
    // localStorage.setItem("popupShown", today.toString());
    //     swal.fire({
    //         html: popupHtml,
    //         allowOutsideClick: false,
    //         cancelButtonText: "Yopish",
    //         timer: 4000,
    //         showCancelButton: true,
    //         showConfirmButton: false,
    //     });
    // }


    const headerAd = document.getElementById("header_" + header._id);
    const popupLink = document.getElementById("popup-link_" + popup._id);
    // click on the main ad opens the pop up window
    headerAd && headerAd.addEventListener("click", async () => {
        await handleIncrement(header._id, "clicked");
    });
    // clicking on the button in the pop up closes it and shows another random advertis
    popupLink && popupLink.addEventListener("click", async () => {
        await handleIncrement(popup._id, "clicked");
    });

});


// functions

async function handleIncrement(id, prop) {
    try {
        const response = await axios.get(
            `${AD_API}/killer/handle-increment?id=${id}&prop=${prop}`
        );

        return response.data;
    } catch (err) {
        console.error(err);
    }
}

async function getAds() {
    try {
        const ads = await axios.get(AD_API + "/killer/get-ads");

        return ads.data;
    } catch (err) {
        console.error(err);
    }
}
