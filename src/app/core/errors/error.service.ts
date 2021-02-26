import { ErrorHandler, Injectable } from '@angular/core';

/**
 * Own error handler to extend the default angular error handler if needed
 */
@Injectable()
export class MyErrorHandler implements ErrorHandler {
	
	/**
	 * Main error handling method. Is called automatically when an error occurs.
	 * 
	 * @param error 
	 */
	handleError(error: any): void {}
}
