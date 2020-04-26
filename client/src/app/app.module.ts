import {BrowserModule}                    from '@angular/platform-browser';
import {NgModule}                         from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule}                 from '@angular/common/http';

import {AppComponent}       from './app.component';
import {LoginComponent}     from './views/login/login.component';
import {JoinComponent}      from './views/join/join.component';
import {EditorComponent} 	from './views/editor/editor.component';
import {AppRoutingModule}   from './app-routing.module';
import {NotFoundComponent}  from './views/not-found/not-found.component';
import {AuthService}        from './auth/auth.service';
import {ToastrModule}       from 'ngx-toastr';
import {ViewComponent}      from './shared/view/view.component';
import { HeaderComponent }  from './shared/header/header.component';
import { PanelComponent }  from './shared/panel/panel.component';
import { ProfileComponent } from './views/profile/profile.component';
import { HomeComponent } 	from './views/home/home.component';
import { HelpComponent } 	from './views/help/help.component';
import { LocalStorageService } from './lib/services/localstorage.service';
import { jqxWindowModule } from 'jqwidgets-ng/jqxwindow';
import { RoomEditComponent } from './views/editor/room-edit/room-edit.component';

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		JoinComponent,
		EditorComponent,
		NotFoundComponent,
		ViewComponent,
		HeaderComponent,
		ProfileComponent,
		HomeComponent,
		HelpComponent,
        PanelComponent,
        RoomEditComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
        AppRoutingModule,
        jqxWindowModule,
		ToastrModule.forRoot({
			timeOut: 5000,
			positionClass: 'toast-bottom-right',
			preventDuplicates: true,
			progressBar: true,
			enableHtml: true,
			closeButton: true
		})
	],
	providers: [AuthService, LocalStorageService],
	bootstrap: [AppComponent]
})
export class AppModule {
}

