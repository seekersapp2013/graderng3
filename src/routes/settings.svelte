<script>
  
  //Vendors
  import { navigate, Link } from "svelte-routing";
  import { onMount } from "svelte";

  import SocialShare from "../modules/share/share";
  import Storage from "../modules/storage/storage";
  // Components
  import NItem from "../components/list-item/list-item.svelte";

  import NIcon from "../components/icon/icon.svelte";
  import NToggle from "../components/toggle-switch/toggle-switch.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import NButtonGroup from "../components/button-group/button-group.svelte";
  import BlockstackOptions from "../components/storage/blockstack.svelte";
  import LocalstorageOptions from "../components/storage/localstorage.svelte";
  import PouchDBOptions from "../components/storage/pouchdb.svelte";

  // Containers
  import StorageManager from "../containers/storage/storage.svelte";
  import ImporterModal from "../containers/importer/importer.svelte";
  import MassEditor from "../containers/mass-editor/mass-editor.svelte";

  import NLayout from "../containers/layout/layout.svelte";

  // Vendors
  import dayjs from "dayjs";
  import localforage from "localforage";

  // Stores
  import { UserStore } from "../store/user-store";
  import { LedgerStore } from "../store/ledger";
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/tracker-store";
  import { BoardStore } from "../store/boards";
  import { NomieAPI } from "../store/napi";
  import { Lang } from "../store/lang";
  import { PeopleStore } from "../store/People-store";
  import { Device } from "../store/device-store";
  import { ContextStore } from "../store/context-store";

  // Config
  import config from "../config/appConfig";
  import Features from "../containers/settings/features.svelte";
  import Tweaks from "../containers/settings/tweaks.svelte";
  import Text from "../components/text/text.svelte";
  import Button from "../components/button/button.svelte";
  import Icon from "../components/icon/icon.svelte";
  import { AppStore } from "../store/app-store";

  export const location = undefined;
  export const style = undefined;

  // consts
  // const Export = new Exporter();

  let data = {
    signedIn: false,
    files: [],
    showMassEditor: false,
  };

  $: alwaysLocate = $UserStore.alwaysLocate;

  let ledger = null;
  let trackers = null;
  // let user = null;
  let fileInput;
  let showImporter = false;

  let st = 0;
  function specialTap() {
    st = st + 1;
    if (st > 9) {
      UserStore.unlockHiddenFeatures();
      Interact.alert("🎁 Special Features Unlocked", "Hey you! 💘");
    }
  }

  let methods = {
    sign_out() {
      UserStore.signout();
    },
    share() {
      SocialShare(`My life goal is to help you increase your purchasing power, while still achieving your life's goals and objectives! Create an account today It's FREE`, "https://grader.app");
    },
    locations() {
      Interact.pickLocation();
    },
    sign_in() {
      UserStore.redirectToSignIn();
    },
    closeMassEditor() {
      data.showMassEditor = false;
    },
    bookAge(date) {
      return dayjs(`${date}-01`).fromNow();
    },
    faq() {
      navigate("/faq");
    },
    shop() {
      navigate("/shop");
    },

    settingChange() {
      UserStore.saveMeta();
    },
    async deleteEverything() {
      try {
        let res = await Interact.confirm("DANGER ZONE!", `This will destroy all of your data in Grader including your points!. Are you sure?`, "Destroy");
        if (res) {
          res = await Interact.confirm(
            "Sorry! One last time.. Really?",
            `You will basically be starting over from scratch, ... You good with that?`,
            "Destroy!"
          );

          if (res === true) {
            Interact.blocker("Deleting data...");
            let files = await Storage.list();

            let promises = [];
            files.forEach((file) => {
              promises.push(Storage.delete(file));
            });
            await Promise.all(promises);
            await localforage.clear();
            localStorage.clear();
            Interact.stopBlocker();
            await Interact.alert("Done", "Your data has been destroyed.");

            window.location.href = "/";
          }
        } // end if confirmed
      } catch (e) {
        Interact.alert(Lang.t("general.error"), e.message);
      }
    },
    switchStorage(type) {
      let from = $UserStore.storageType;
      let to = type;
      let conf = confirm(
        `${Lang.t(
          "storage.switch",
          `Switch from ${from} to ${to}? You can always switch back. 

Note: Your data will not automatically move over. You'll first need to export it, then you can import into this new storage.`
        )}`
      );
      if (conf === true) {
        if (["local", "pouchdb", "blockstack"].indexOf(to) > -1) {
          UserStore.setStorage(to);
          Interact.reload();
        } else {
          alert(`Error: ${to} is not valid`);
        }
      }
    },
    storageMenu() {
      let buttons = [
        {
          title: `${$UserStore.storageType === "local" ? "✓" : ""} ${Lang.t("storage.local_title", "This Device Only")}`,
          description: Lang.t("storage.local_description", "Good for getting started, but make sure you backup your data."),
          click() {
            methods.switchStorage("local");
          },
        },
        {
          title: `${$UserStore.storageType === "blockstack" ? "✓" : ""} Blockstack`,
          description: Lang.t(
            "storage.blockstack_description",
            "Sync across multiple devices using Blockstack's free and encrypted storage."
          ),
          click() {
            methods.switchStorage("blockstack");
          },
        },
        {
          title: `${$UserStore.storageType === "pouchdb" ? "✓" : ""} ${Lang.t("storage.pouchdb_title", "CouchDB (beta)")}`,
          description: Lang.t(
            "storage.pouchdb_description",
            "Sync your data in real to a remote CouchDB server. ⚠️ Not good for multiple devices."
          ),
          click() {
            methods.switchStorage("pouchdb");
          },
        },
      ];
      Interact.popmenu({
        title: Lang.t("storage.type_selector_title", `Storage Options`),
        description: Lang.t("storage.type_selector_title", `How would you like your data stored?`),
        buttons: buttons,
      });
    },
    // boardsToggle() {
    //   $UserStore.meta.boardsEnabled = !$UserStore.meta.boardsEnabled;
    //   UserStore.saveMeta();
    // },
  };
  let view = Storage.local.get("settings/view") || "features";
  function changeView(v) {
    view = v;
    Storage.local.put("settings/view", v);
    Device.scrollToTop();
  }
  


  let basic =  20 + $UserStore.launchCount + TrackerStore.getAsArray().length;


   // variable declarations
   let money = basic;
  let numberOfBuilding = 0;
  let buildingProduction = 1; // $ produced per building per tick
  let tickSpeed = 1000;
    
  // reactive declarations
  $: cantBuy = cost > money;
  $: cost = (numberOfBuilding + 1) * 5;
  $: productionPerTick = numberOfBuilding * buildingProduction;
  
  // function declarations
  
  // update the values of `money` and `numberBuildings`
  function updateNumbers(){
    money -= cost;
    numberOfBuilding += 1
  }

  // update `money` with `productionPerTick` and set a timeout to call itself after `tickSpeed` ms
  function updateMoney(){
    money += productionPerTick;
    setTimeout(updateMoney, tickSpeed);
  }
  
  
  // const setTimeout = setTimeout;
  onMount(() => {
    Device.scrollToTop();
    updateMoney();
  });

  
</script>



<style>
  button {
    outline: 1px solid black;
    background: aliceblue;
    cursor: pointer;
  }

  button.cantbuy {
    background: #555;
    color: #DDD;
    cursor: default;
  }
</style>
<NLayout pageTitle="Settings">
  <div slot="header">
    <div class="n-toolbar-grid container">
      <div class="left" />
      <div class="main">
        <Text bold>{Lang.t('settings.settings')}</Text>
      </div>
      <div class="right">
        <button on:click={methods.faq} class="btn tap-text">{Lang.t('general.faq')}</button>
      </div>
    </div>
    <div class="n-toolbar px-2 pb-1 container">
      <NButtonGroup
        buttons={[{ label: 'Features', active: view == 'features', click() {
              changeView('features');
            } }, { label: 'Tweaks', active: view == 'tweaks', click() {
              changeView('tweaks');
            } }, { label: 'Data', active: view == 'data', click() {
              changeView('data');
            } },
            { label: 'Card', active: view == 'card', click() {
              changeView('card');
            } },{ label: 'About', active: view == 'about', click() {
              changeView('about');
            } }]} />
    </div>
  </div>

  <div slot="content" class="pt-2">
    {#if $UserStore.meta}
      <div class="page page-settings">
        <div class="container p-0">
          {#if view == 'features'}
            <Features />
          {:else if view == 'tweaks'}
            <Tweaks />
          {:else if view == 'data'}
            <!--
              *******************************************
              DATA VIEW
              *******************************************
            -->
            <div class="n-list pb-2">
              <NItem itemDivider>Import Data</NItem>
              <!-- <NItem clickable title={Lang.t('settings.nomie-api')} on:click={() => navigate('/api')}>
                <span slot="left">🕸</span>
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </NItem> -->
              <NItem
                clickable
                title={`${Lang.t('settings.import-from-backup')}`}
                on:click={() => {
                  showImporter = true;
                }}>
                <span slot="left">📦</span>
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
                <input slot="right" class="d-none" type="file" bind:this={fileInput} on:change={methods.onImportFile} />
              </NItem>
              <NItem clickable title={`${Lang.t('settings.import-from-csv', 'Import from CSV')}`} to="/settings/import/csv">
                <span slot="left">📄</span>
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </NItem>
            </div>
            <div class="n-list pb-2">
              <NItem itemDivider>Export Data</NItem>
              <NItem detail title={Lang.t('settings.generate-backup')} to="/settings/export/backup">
                <span slot="left">📦</span>

              </NItem>
              <NItem detail title={Lang.t('settings.generate-csv')} to="/settings/export/csv">
                <span slot="left">📃</span>
              </NItem>
            </div>
            <div class="n-list pb-2">
              <NItem itemDivider>Storage Location</NItem>
              <NItem on:click={methods.storageMenu}>
                <span slot="left">☁️</span>
                {#if $UserStore.storageType === 'local'}
                  This device only
                {:else if $UserStore.storageType === 'pouchdb'}
                  {Lang.t('storage.pouchdb', 'Local + CouchDB')}
                {:else if $UserStore.storageType === 'blockstack'}{Lang.t('storage.blockstack', 'Blockstack')}{/if}
                <div slot="right">
                  <Text size="sm" className="text-primary-bright">Change</Text>
                </div>
              </NItem>

              {#if $UserStore.storageType === 'blockstack'}
                <BlockstackOptions />
              {/if}
              {#if $UserStore.storageType === 'local'}
                <LocalstorageOptions />
              {/if}
              {#if $UserStore.storageType === 'pouchdb'}
                <PouchDBOptions />
              {/if}
            </div>
            <div class="n-list pb-2">
              <NItem itemDivider>Data Management</NItem>
              <NItem
                detail
                title="Browse Files..."
                on:click={() => {
                  navigate('/files');
                }}>
                <span slot="left">📂</span>
              </NItem>

              <NItem
                detail
                title="{Lang.t('settings.find-and-replace')}..."
                on:click={() => {
                  data.showMassEditor = true;
                }}>
                <span slot="left">🕵️‍♂️</span>
              </NItem>

            </div>

            <!-- <div class="n-list solo my-2">
              <Text bold className="my-3 mx-3">{Lang.t('general.type', 'Finding old data')}</Text>
              <NItem bottomLine title="Find Context" on:click={ContextStore.searchForContext}>
                <span slot="left">💬</span>
              </NItem>
              <NItem title="Find People" on:click={PeopleStore.searchForPeople}>
                <span slot="left">👨‍👨‍👧‍👧</span>
              </NItem>
            </div> -->

            {:else if view == 'card'}

            <h2> Card Request Form</h2>
            <div class='prefinery-form-embed'></div>


          {:else if view == 'about'}
            <!--
              *******************************************
              ABOUT VIEW 
              *******************************************
            -->
            <div class="n-list pb-1">
              <NItem itemDivider>Grader Points</NItem>
              
              <NItem title={Lang.t('You Have')}>
                <span slot="right">{money}</span>
              </NItem>

              <NItem title={Lang.t('You Used')}>
                <span slot="right">{numberOfBuilding} </span>
              </NItem>

              <NItem title={Lang.t('Next Purchase Will Cost')}>
                <span slot="right">{numberOfBuilding}  </span>
              </NItem>

              <NItem title={Lang.t('You Gained')}>
                <span slot="right">{productionPerTick} </span>
              </NItem>

              <!-- <h1>You have {money} $!</h1> -->

              <!-- <button on:click={updateNumbers} class:cantbuy={cantBuy} disabled={cantBuy}>
                <p>{numberOfBuilding} buildings bought, next one cost {cost}$.</p>
                <p>You gain {productionPerTick}$ / tick.</p>
                <p>Grow Points</p>
              </button> -->



<!--               
              <NItem detail title="Learn More" href="https://nomie.app?s=dap">
                <span slot="right" class="text-inverse-3">Nomie.app</span>
              </NItem>
              <NItem title="Become a Patron" detail href="https://www.patreon.com/nomieapp">
                <span slot="right" class="text-inverse-3">Patreon</span>
              </NItem>
              <NItem title="Reddit r/nomie" detail href="https://reddit.com/r/nomie">
                <span slot="right" class="n-row text-inverse-3">/r/nomie</span>
              </NItem>

              <NItem title="Open Source" detail href="https://github.com/open-nomie/nomie">
                <span slot="right" class="n-row text-inverse-3">GitHub</span>
              </NItem> -->
            </div>

            <div class="n-list pb-1">
              <NItem itemDivider>App Details</NItem>
              <NItem title={Lang.t('general.trackers', 'Tracker Count')}>
                <span slot="right">{TrackerStore.getAsArray().length}</span>
              </NItem>

              <NItem title={Lang.t('general.first_log', 'First Log')}>
                <div class="" slot="right">
                  {#await LedgerStore.getFirstDate()}
                    Loading...
                  {:then date}
                    <div class="text-sm">{date.format('MMM YYYY')}</div>
                  {/await}
                  <!--  -->
                </div>
              </NItem>
              <NItem title={Lang.t('general.launch-count', 'Launch Count')}>
                <div class="n-row" slot="right">
                  <!-- <button class="btn btn-clear" on:click={UserStore.resetLaunchCount}>
                    <NIcon name="delete" className="fill-red" size="18" />
                  </button> -->
                  {$UserStore.launchCount}
                </div>
              </NItem>
              <NItem title={Lang.t('general.device', 'Device')}>
                <span slot="right">{$Device.device}</span>
              </NItem>
              <NItem title={Lang.t('general.platform', 'Platform')}>
                <span slot="right">{$Device.platform}</span>
              </NItem>
              <NItem title={Lang.t('general.pwa', 'PWA')}>
                <span slot="right">{$Device.pwa}</span>
              </NItem>
            </div>

            <NItem itemDivider>Version</NItem>
            <NItem title="Version APP_VERSION " description="Built APP_BUILD_DATE ">
              <span slot="right" class="n-row">
                <Button size="xs" on:click={AppStore.reveal} className="ml-2">What's new</Button>
              </span>
            </NItem>
            <NItem
              title="Onboarded"
              on:click={() => {
                navigate('/setup');
              }}>
              <span slot="right" class="text-primary-bright">{Lang.t('settings.redo-setup', 'Redo Setup')}</span>
            </NItem>
          {/if}
          <!-- END Views -->

          <div class="n-list solo mt-3">
            <NItem title={Lang.t('settings.nomie-needs-you', 'Grader needs You!')}>
              <Text size="sm" faded>
                {Lang.t('settings.become-a-patron-message', 'Help keep Grader development moving forward, free, no ads, and open.')}
              </Text>
              <img src="/images/nomie-head-on.png" height="75" alt="Nomie" slot="left" class="pr-0" />
            </NItem>
            <NItem
              detail
              title={Lang.t('general.become-a-patron', 'Become a Patron')}
              className="text-primary-bright"
              on:click={() => {
                window.open(config.patreon, '_system');
              }}>
              <Text size="xs" color="inverse-2" className="mt-1">Pick from 1 of 3 Patreon levels</Text>
            </NItem>
          </div>

          <NItem className="bg-transparent">
            <div class="px-2 py-4 text-center">
              <Text size="md" className="mb-2">
                {`${Lang.t('general.questions')}`}
                <a class="text-primary-bright" href={`mailto:${config.support_email}?subject=Nomie APP_VERSION `}>
                  {config.support_contact}
                </a>
              </Text>
              <Text size="sm" on:click={specialTap}>&copy; Copyright 2020 - {dayjs().format('YYYY')}</Text>
              <Text size="sm" inline faded>All Rights Reserved</Text>
              <Text size="sm" inline>
                <a class="text-primary-bright" href="https://www.creditsense.com.ng" traget="_system">Credit Sense</a>
              </Text>
            </div>
          </NItem>

          <NItem className="bg-transparent mt-4 mb-2" title="⚠️ Danger Zone">

            <div slot="right">
              <Button color="danger" size="sm" on:click={methods.deleteEverything}>Destory all Data</Button>
            </div>
          </NItem>

        </div>
        <!-- end container -->

      </div>
    {/if}
  </div>
  <!-- end content slot-->

</NLayout>

<MassEditor on:close={methods.closeMassEditor} show={data.showMassEditor} />

{#if showImporter}
  <ImporterModal on:dismiss={() => (showImporter = false)} />
{/if}
