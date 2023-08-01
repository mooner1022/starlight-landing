<script>
    import Modal from "./Modal.svelte";

    const DOWNLOAD_URL = "https://cdn.discordapp.com/attachments/1106997962879545364/1135781787520466994/app-release.apk";

    function toggleModal() {
        showModal = !showModal;
        document.body.style.position = showModal ? "fixed" : "static";
        if (showModal)
            downloadFile(DOWNLOAD_URL, "StarLight-v0_0_1.apk");
    }

    function downloadFile(url, name) {
        const aTag = document.createElement("a");
        aTag.href = url;
        aTag.download = name;
        document.body.appendChild(aTag);
        aTag.click();
        aTag.remove();
    }

    let showModal = false;
</script>
<section id="title">
    <div class="has-text-white">
        <h1 class="heading is-size-1 is-size-3-mobile">Project ✦</h1>
        <h1 class="heading is-size-1 is-size-3-mobile has-text-weight-bold" id="title-label">StarLight</h1>
        <h3 class="has-text-weight-light">The next-generation messenger auto-reply<br>application with <strong class="has-text-white">Plug-in</strong> support</h3>
    </div>
    <div class="pt-6 pb-6 mt-6 mb-6 is-hidden-mobile"></div>
    <div class="mockup-image is-hidden-mobile">
        <img src="assets/mockup.png" alt="mockup">
    </div>
    <div class="mockup-image is-hidden-tablet">
        <img src="assets/mockup_noshadow.png" alt="mockup">
    </div>
    <div class="column is-one-third-widescreen is-two-fifths-tablet is-full-mobile-mobile mt-6 p-3 has-background-white has-shadow" id="title-version">
        <div class="level">
            <div class="level-left ml-4 pl-3 is-block" id="title-download-label">
                <div class="has-text-grey">Latest version</div>
                <div class="is-size-4 has-text-weight-bold">v0.0.1-alpha</div>
            </div>
            <div class="level-right icon-text has-text-weight-bold has-text-white p-4 pr-5 mr-1" id="button-download" tabindex="0" role="button" on:click={toggleModal} on:keypress={toggleModal}>
                <span class="icon">
                    <i class="fa-solid fa-download"/>
                </span>
                <span>Download</span>
            </div>
        </div>
    </div>
    <div id="title-arrow" class="is-centered">
        <img src="assets/arrow.svg" alt="arrow">
    </div>
    <Modal {showModal} on:click={toggleModal}>
        <div slot="content" class="has-text-centered">
            <div class="content mt-4" style="font-size: 1.5em;">
                <span class="icon is-large" style="font-size: 2.5em; color: #ad977a">
                    ✦
                </span>
                <br>
                다운로드가 시작되었어요!
            </div>
            <div class="mb-5" style="font-size: 1.1em">
                다운로드가 자동으로 시작되지 않았다면, <a href="{DOWNLOAD_URL}"><u>여기</u></a>를 클릭해주세요.
            </div>
        </div>
    </Modal>
</section>