<script>
    export let showModal = false;

</script>

{#if showModal}
<div class="modal is-active" id="modal">
    <div class="modal-background" on:click></div>
    <div class="modal-card">
        <div class="modal-card-body" id="body">
            <slot name="content"/>
            <button class="button is-dark" on:click>확인</button>
        </div>
    </div>
</div>
{/if}

<style>
    #modal, ::backdrop {
        overscroll-behavior: contain;
    }

    #modal > .modal-card {
        height: auto;
    }

    .modal-card > #body {
        border-radius: 1.5em;
        justify-content: center;
        display: flex;
        flex-direction: column;
    }

    #body > button {
        position: static;
        bottom: 1em;
        margin-left: auto;
        margin-right: auto;
        width: 90%;
        border-radius: 1em;
        height: 3.5em;
    }
</style>