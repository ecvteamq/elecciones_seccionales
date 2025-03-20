import { format, addSeconds, compareAsc, differenceInSeconds } from 'date-fns';

export class Token {
  readonly token_type!: string;
  readonly expires_in!: number;
  readonly token: any;
  readonly refresh_token: any;

  readonly fechaInicio!: string;

  constructor(token: Token) {
    if (token) {      
      this.token_type = token.token_type;
      // this.expires_in = token.expires_in.toString() == '1h' ? 3600 : 0 ;
      this.expires_in = token.expires_in;
      this.token = token.token;
      this.refresh_token = token.refresh_token;      

      this.fechaInicio = token.fechaInicio
        ? format(new Date(token.fechaInicio), "yyyy-MM-dd'T'HH:mm:ss.SSS")
        : format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS");
        console.log("fecha de inicio constructor:",this.fechaInicio);
        
    }
  }

  get authorization(): string {
    return `${this.token_type} ${this.token}`;
  }

  get timeRefreshToken(): number {
    const timeOut: number = 300; // 5min de espera para que no se llege a los code_status 401 y se pierdan requests
    const today: Date = new Date();
    const differenceInSecond: number = differenceInSeconds(
      today,
      new Date(this.fechaInicio),
    );
    const timeToRefresh = this.expires_in - differenceInSecond - timeOut;

    return timeToRefresh <= 0? 1: timeToRefresh;
  }

  get isExpired(): boolean {
    // const timeOut: number = 300; // 5min de espera para que no se llege a los code_status 401 y se pierdan requests
    const today: Date = new Date();
    const endAtToken: Date = addSeconds(
      new Date(this.fechaInicio),
      this.expires_in
    );
    console.log("today:",today);
    console.log("end token:",endAtToken);
    const comparacion = compareAsc(today, endAtToken);
    return comparacion === 1 || comparacion === 0;
  }
}
