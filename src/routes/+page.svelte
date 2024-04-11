<script>
    import Modal from "../components/Modal.svelte";
    import DayNightToggle from "../components/DayNightToggle.svelte";
    import {onMount} from "svelte";
    import AOS from "aos";
    import "aos/dist/aos.css";
    import "./styles.scss";

    const VERSION_CHECK_URL = "https://raw.githubusercontent.com/mooner1022/starlight-version/master/version.json"
    const DIST_VERSION      = "snapshot";
    let   IS_DARK_MODE      = false;

    /** @type Versions */
    let versions;

    let showModal = false;
    onMount(async function () {
        AOS.init();

        //return;
        versions = await fetchVersionInfo();
        console.log("version: " + versions[DIST_VERSION].version);
        console.log("downloadUrl: " + getDownloadUrl());
    });

    /*
    function handleScrollEvent() {
        const container = document.getElementById("main");
        if (!container)
            return;

        let isShown = container.classList.contains("fixed-center");
        console.log("isShown: " + isShown);

        if (isShown)
            container.classList.remove("fixed-center");
        else
            container.classList.add("fixed-center");
    }
     */

    function toggleModal() {
        if (!versions)
            return;
        showModal = !showModal;
        document.body.style.position = showModal ? "fixed" : "static";
        if (showModal)
            downloadFile(versions[DIST_VERSION].downloadUrl, "StarLight-v0_0_1.apk");
    }

    /**
     * @returns {Promise<Versions>}
     */
    async function fetchVersionInfo() {
        return fetch(VERSION_CHECK_URL)
            .then(response => response.json())
            .catch((err) => console.error(err));
    }

    /**
     * @param {string} url
     * @param {string} name
     */
    function downloadFile(url, name) {
        const aTag = document.createElement("a");
        aTag.href = url;
        aTag.download = name;
        document.body.appendChild(aTag);
        aTag.click();
        aTag.remove();
    }

    function getDownloadUrl() {
        return versions[DIST_VERSION].downloadUrl;
    }

    /**
     * @typedef {{ snapshot: Version, beta: Version, release: Version }} Versions
     * @typedef {{ version: string, versionCode: number, downloadUrl: string }} Version
     */
</script>
<DayNightToggle on:update={(event) => { IS_DARK_MODE = event.detail; }}/>
<div id="container-bg-square">
    <img src="assets/square_bg.svg" id="bg-square" alt="bg square" class="fade-out" data-aos data-aos-anchor="#main">
</div>
<section id="title">
    <div id="title-left">
        <div class="text white" id="title-text-wrapper">
            <h1 class="heading is-size-1 is-size-3-mobile">Project ✦</h1>
            <h1 class="heading is-size-1 is-size-3-mobile has-text-weight-bold" id="title-label">StarLight</h1>
            <h3 class="has-text-weight-light">The next-generation messenger auto-reply<br>application with <strong class="has-text-white">Plug-in</strong> support</h3>
        </div>
        <div class="pt-6 pb-6 mt-6 mb-6 desktop-only"></div>
        <div class="mockup-image mobile-only fade-out" data-aos data-aos-anchor="#main">
            <img src="assets/mockup_noshadow.png" alt="mockup">
        </div>
        <div class="column is-full-mobile mt-6 p-3 fade-out" id="title-version" data-aos data-aos-anchor="#main">
            <div class="level">
                <div class="level-left ml-4 pl-3" id="title-download-label">
                    <div class="has-text-grey">Latest version</div>
                    <div class="is-size-4 has-text-weight-bold text black" id="version-number">{versions ? 'v'+versions[DIST_VERSION].version : "Checking..."}</div>
                </div>
                <div class="level-right icon-text has-text-weight-bold text white p-4 pr-5 mr-1" id="button-download" tabindex="0" role="button" on:click={toggleModal} on:keypress={toggleModal}>
                    <span class="icon">
                        <i class="fa-solid fa-download"/>
                    </span>
                    <span>Download</span>
                </div>
            </div>
        </div>
    </div>
    <div id="title-right" class="desktop-only fade-out" data-aos data-aos-anchor="#main">
        <div class="mockup-image">
            <img src="assets/mockup.png" alt="mockup">
        </div>
    </div>
</section>
<div id="title-arrow">
    {#if (IS_DARK_MODE)}
        <img src="assets/arrow_night.svg" alt="arrow" class="fade-out" data-aos data-aos-anchor="#main">
    {:else}
        <img src="assets/arrow_day.svg" alt="arrow" class="fade-out" data-aos data-aos-anchor="#main">
    {/if}
</div>
<section class="m-4 section" id="main">
    <h1 class="title text is-center has-text-centered" style="letter-spacing: 5px;" data-aos="fade" data-aos-anchor-placement="center-center">
        PROJECT <span style="color: #ad977a">✦</span> STARLIGHT
    </h1>
    <hr data-aos="slide-right">
    <h2 class="subtitle text is-center has-text-centered mt-3" data-aos="fade" data-aos-anchor-placement="center-center">
        Project StarLight is yet another scriptable messenger auto-reply application,<br/>
        but with plugin and lightweight concurrent event support.
    </h2>
</section>
<section class="m-4 section">
    <h1 class="title text mb-6" data-aos="fade">
        <i class="fa-solid fa-cubes"></i>
        This page is still in construction!
    </h1>
    <h2 class="subtitle text" data-aos="fade">
        The development of the page you're currently viewing isn't complete yet.<br>
        Please be patient until we complete the construction :)
    </h2>
    <img src="assets/constructing.jpg" alt="meme" data-aos="fade" style="max-width: 100%"/>
</section>
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
            다운로드가 자동으로 시작되지 않았다면, <a href="{getDownloadUrl()}"><u>여기</u></a>를 클릭해주세요.
        </div>
    </div>
</Modal>