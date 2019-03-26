import { Component, OnInit, ElementRef } from '@angular/core'
import { AuthService, Notifier, RedirectService, ServerService } from '@app/core'
import { UserCreate } from '../../../../shared'
import { FormReactive, UserService, UserValidatorsService } from '../shared'
import { I18n } from '@ngx-translate/i18n-polyfill'
import { FormValidatorService } from '@app/shared/forms/form-validators/form-validator.service'

@Component({
  selector: 'my-signup',
  templateUrl: './signup.component.html',
  styleUrls: [ './signup.component.scss' ]
})
export class SignupComponent extends FormReactive implements OnInit {
  info: string = null
  error: string = null
  signupDone = false
  recaptchaRequired = false
  recaptchaSiteKey: string = null
  recaptchaSecretKey: string = null

  constructor (
    protected formValidatorService: FormValidatorService,
    private authService: AuthService,
    private userValidatorsService: UserValidatorsService,
    private notifier: Notifier,
    private userService: UserService,
    private serverService: ServerService,
    private redirectService: RedirectService,
    private i18n: I18n,
    private elementRef:ElementRef
  ) {
    super()
  }

  get instanceHost () {
    return window.location.host
  }

  get requiresEmailVerification () {
    return this.serverService.getConfig().signup.requiresEmailVerification
  }
  
  get requiresRecaptcha () {
    return this.serverService.getConfig().recaptchaForm.enabled && this.serverService.getConfig().recaptchaForm.recaptchaSiteKey != '' && this.serverService.getConfig().recaptchaForm.recaptchaSecretKey != ''
  }

  ngOnInit () {
    this.buildForm({
      username: this.userValidatorsService.USER_USERNAME,
      password: this.userValidatorsService.USER_PASSWORD,
      email: this.userValidatorsService.USER_EMAIL,
      terms: this.userValidatorsService.USER_TERMS
    })
    
    // Recaptcha vars
    this.recaptchaRequired = this.requiresRecaptcha
    this.recaptchaSiteKey = this.serverService.getConfig().recaptchaForm.recaptchaSiteKey
    this.recaptchaSecretKey = this.serverService.getConfig().recaptchaForm.recaptchaSecretKey
  }
  
  ngAfterViewInit() { // https://stackoverflow.com/questions/38088996/adding-script-tags-in-angular-component-template
    if(this.recaptchaRequired){
		var s = document.createElement("script");
		s.type = "text/javascript";
		s.src = "https://www.google.com/recaptcha/api.js";
		this.elementRef.nativeElement.appendChild(s);
	}
  }

  signup () {
    this.error = null

    let userCreate: UserCreate = this.form.value
    
    if(this.recaptchaRequired){
		userCreate["g-recaptcha-response"] = document.getElementById('g-recaptcha-response').value
    }

	this.userService.signup(userCreate).subscribe(
		() => {
			this.signupDone = true

			if (this.requiresEmailVerification) {
			  this.info = this.i18n('Welcome! Now please check your emails to verify your account and complete signup.')
			  return
			}

			// Auto login
			this.authService.login(userCreate.username, userCreate.password)
				.subscribe(
				  () => {
					this.notifier.success(this.i18n('You are now logged in as {{username}}!', { username: userCreate.username }))

					this.redirectService.redirectToHomepage()
				  },

				  err => this.error = err.message
				)
		},
		err => this.error = err.message
	)
  }
}
