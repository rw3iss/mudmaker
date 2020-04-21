import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './views/editor/editor.component';
import { HelpComponent } from "./views/help/help.component";
import { HomeComponent } from "./views/home/home.component";
import { JoinComponent } from "./views/join/join.component";
import { LoginComponent } from './views/login/login.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { ProfileComponent } from "./views/profile/profile.component";
import { AuthGuard } from './auth/AuthGuard';

const routes: Routes = [
	{path: '', component: HomeComponent},
	{path: 'login', component: LoginComponent},
	{path: 'logout', component: LoginComponent},
	{path: 'join', component: JoinComponent},
	{path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
	{path: 'editor', component: EditorComponent},
	{path: 'help', component: HelpComponent},
	{path: '**', component: NotFoundComponent}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
