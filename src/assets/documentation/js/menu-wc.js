'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">Forecastr documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                        <li class="link">
                            <a href="dependencies.html" data-type="chapter-link">
                                <span class="icon ion-ios-list"></span>Dependencies
                            </a>
                        </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse" ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AdminModule.html" data-type="entity-link">AdminModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AdminModule-9bfa53b41987315c007b897cb6575aab"' : 'data-target="#xs-components-links-module-AdminModule-9bfa53b41987315c007b897cb6575aab"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AdminModule-9bfa53b41987315c007b897cb6575aab"' :
                                            'id="xs-components-links-module-AdminModule-9bfa53b41987315c007b897cb6575aab"' }>
                                            <li class="link">
                                                <a href="components/AddMonthDialog.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AddMonthDialog</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AddProjectDialog.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AddProjectDialog</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AddUserDialog.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AddUserDialog</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdminComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AdminComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DashboardComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DashboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MonthsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MonthsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProjectsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TeamsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TeamsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UsersComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UsersComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-8436acb902e92db859d5255eed18e9fd"' : 'data-target="#xs-components-links-module-AppModule-8436acb902e92db859d5255eed18e9fd"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-8436acb902e92db859d5255eed18e9fd"' :
                                            'id="xs-components-links-module-AppModule-8436acb902e92db859d5255eed18e9fd"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoginComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link">AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CoreModule.html" data-type="entity-link">CoreModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-CoreModule-2c04ab0b5f73966ac55cdc5c2936a42d"' : 'data-target="#xs-injectables-links-module-CoreModule-2c04ab0b5f73966ac55cdc5c2936a42d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CoreModule-2c04ab0b5f73966ac55cdc5c2936a42d"' :
                                        'id="xs-injectables-links-module-CoreModule-2c04ab0b5f73966ac55cdc5c2936a42d"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/BusinessOperationsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>BusinessOperationsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LoginService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>LoginService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PageStateService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>PageStateService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ForecastModule.html" data-type="entity-link">ForecastModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ForecastModule-f2b9313cb0f21ee67be093e4ed76adc3"' : 'data-target="#xs-components-links-module-ForecastModule-f2b9313cb0f21ee67be093e4ed76adc3"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ForecastModule-f2b9313cb0f21ee67be093e4ed76adc3"' :
                                            'id="xs-components-links-module-ForecastModule-f2b9313cb0f21ee67be093e4ed76adc3"' }>
                                            <li class="link">
                                                <a href="components/CSVExportDialog.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CSVExportDialog</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FcEntryComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FcEntryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FcEntrySummaryComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FcEntrySummaryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FcProjectComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FcProjectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ForecastComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ForecastComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IndividualComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">IndividualComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RemoveProjectDialog.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RemoveProjectDialog</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TeamComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TeamComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TeamleadMonthComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TeamleadMonthComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TeamleadSummaryComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TeamleadSummaryComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/LayoutModule.html" data-type="entity-link">LayoutModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-LayoutModule-a26c6864a74ef4e609453d25c6cf6486"' : 'data-target="#xs-components-links-module-LayoutModule-a26c6864a74ef4e609453d25c6cf6486"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-LayoutModule-a26c6864a74ef4e609453d25c6cf6486"' :
                                            'id="xs-components-links-module-LayoutModule-a26c6864a74ef4e609453d25c6cf6486"' }>
                                            <li class="link">
                                                <a href="components/FooterComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FooterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GetStarted.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">GetStarted</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">HeaderComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AppDateAdapter.html" data-type="entity-link">AppDateAdapter</a>
                            </li>
                            <li class="link">
                                <a href="classes/Entry.html" data-type="entity-link">Entry</a>
                            </li>
                            <li class="link">
                                <a href="classes/Export.html" data-type="entity-link">Export</a>
                            </li>
                            <li class="link">
                                <a href="classes/FcEntry.html" data-type="entity-link">FcEntry</a>
                            </li>
                            <li class="link">
                                <a href="classes/FcProject.html" data-type="entity-link">FcProject</a>
                            </li>
                            <li class="link">
                                <a href="classes/Month.html" data-type="entity-link">Month</a>
                            </li>
                            <li class="link">
                                <a href="classes/Project.html" data-type="entity-link">Project</a>
                            </li>
                            <li class="link">
                                <a href="classes/Summary.html" data-type="entity-link">Summary</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link">User</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link">AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BusinessOperationsService.html" data-type="entity-link">BusinessOperationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ForecastService.html" data-type="entity-link">ForecastService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoginService.html" data-type="entity-link">LoginService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MonthService.html" data-type="entity-link">MonthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MyErrorHandler.html" data-type="entity-link">MyErrorHandler</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PageStateService.html" data-type="entity-link">PageStateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProjectService.html" data-type="entity-link">ProjectService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TeamForecastService.html" data-type="entity-link">TeamForecastService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link">UserService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UtilitiesService.html" data-type="entity-link">UtilitiesService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interceptors-links"' :
                            'data-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/HttpRequestInterceptorService.html" data-type="entity-link">HttpRequestInterceptorService</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/RoleGuard.html" data-type="entity-link">RoleGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Level.html" data-type="entity-link">Level</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Probability.html" data-type="entity-link">Probability</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Role.html" data-type="entity-link">Role</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SummaryData.html" data-type="entity-link">SummaryData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SummaryDataProject.html" data-type="entity-link">SummaryDataProject</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});