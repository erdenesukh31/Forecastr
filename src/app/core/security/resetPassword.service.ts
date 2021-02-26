import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class ResetPasswordService {

    resetPasswordApiUrl: string = environment.api + environment.resetPasswordPath;
    options: any = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
        observe: 'response',
        responseType: 'blob',
    };
    optionsWithTokenRequest: any = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
        observe: 'response',
        responseType: 'text',
    };

    constructor(
        private http: HttpClient,
    ) {}

    resetPassword(emailAddress: string) { 
        emailAddress = "\"" + emailAddress + "\"";
        return this.http.post(this.resetPasswordApiUrl, emailAddress, this.options);
    }
    resetPasswordWithToken(token: string, newPassword: string) {
        let resetPasswordUrlWithToken = this.resetPasswordApiUrl + "/" + token;
        newPassword = "\"" + newPassword + "\"";
        return this.http.put(resetPasswordUrlWithToken, newPassword, this.optionsWithTokenRequest);
    }
}