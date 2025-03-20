import { resolve } from "path";
import Swal from "sweetalert2";

export class SweetalertConfig {



    showMessage(type: any, text?: any, url?: any) {
        let Promise;
        if (type == 'confirm') {
            return new Promise((resolve, reject) => {
                this.confirm(text);
            });
        }
        else if (type == 'success')
            return this.modalSuccess(text, url);
        else if (type == 'error')
            return this.modalError(text, url);
        else if (type == 'loading')
            return this.loading(text);
        else if (type == 'close')
            return this.close();
    }


    public confirm(text?) {
        return new Promise((resolve, reject) => {
            Swal.fire({
                title: 'Estas seguro?',
                text: text,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText:'Cancelar',
                confirmButtonText: 'Si,continuar'
            }).then((result) => {
                if (result.isConfirmed) {
                    resolve("ok");
                } else {
                    reject("cancelar");
                }
            }).catch(er => {
                reject(er);
            });
        });
    }

    private modalSuccess(text?, url?) {
        if (url == null) {
            Swal.fire({
                icon: "success",
                title: "Se ha registrado la información",
                text: text,
                width: "46rem",
            });
        } else {
            Swal.fire({
                icon: "success",
                title: "Se ha registrado la información",
                text: text,
                width: "46rem",
            }).then((result: any) => {
                if (result.value) {
                    window.open(url, "_top");
                }
            });
        }
    }

    private modalError(text?, url?) {
        if (url == null) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: text,
                width: "46rem",
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: text,
                width: "46rem",
            }).then((result: any) => {
                if (result.value) {
                    window.open(url, "_top");
                }
            });
        }
    }

    private loading(text?) {
        Swal.fire({
            text: text,
            width: "60rem",
            allowOutsideClick: false
        });
        Swal.showLoading(null);
    }

    private close() {
        Swal.close();
    }

    // /** Modales con librerira de sweet alert*/
    // public showMessage(type: any, text?: any, url?: any) {
    //     switch (type) {
    //         case "error":
    //             if (url == null) {
    //                 Swal.fire({
    //                     icon: "error",
    //                     title: "Error",
    //                     text: text,
    //                     width: "46rem",
    //                 });
    //             } else {
    //                 Swal.fire({
    //                     icon: "error",
    //                     title: "Error",
    //                     text: text,
    //                     width: "46rem",
    //                 }).then((result: any) => {
    //                     if (result.value) {
    //                         window.open(url, "_top");
    //                     }
    //                 });
    //             }

    //             break;

    //         case "success":
    //             if (url == null) {
    //                 Swal.fire({
    //                     icon: "success",
    //                     title: "Se ha registrado la información",
    //                     text: text,
    //                     width: "46rem",
    //                 });
    //             } else {
    //                 Swal.fire({
    //                     icon: "success",
    //                     title: "Se ha registrado la información",
    //                     text: text,
    //                     width: "46rem",
    //                 }).then((result: any) => {
    //                     if (result.value) {
    //                         window.open(url, "_top");
    //                     }
    //                 });
    //             }

    //             break;

    //         case "success-confirm":
    //             if (url == null) {
    //                 Swal.fire({
    //                     icon: "success",
    //                     title: "Se ha confirmado correctamente la información",
    //                     text: text,
    //                     width: "46rem",
    //                 });
    //             } else {
    //                 Swal.fire({
    //                     icon: "success",
    //                     title: "Se ha confirmado correctamente la información",
    //                     text: text,
    //                     width: "46rem",
    //                 }).then((result: any) => {
    //                     if (result.value) {
    //                         window.open(url, "_top");
    //                     }
    //                 });
    //             }

    //             break;

    //         case "loading":
    //             Swal.fire({
    //                 text: text,
    //                 width: "60rem",
    //                 allowOutsideClick: false
    //             });
    //             Swal.showLoading(null);

    //             break;

    //         case "html":
    //             Swal.fire({
    //                 allowOutsideClick: false,
    //                 title: "Haga click para continuar con el pago...",
    //                 icon: "info",
    //                 html: text,
    //                 showConfirmButton: false,
    //                 showCancelButton: true,
    //                 cancelButtonColor: "#d33",
    //                 cancelButtonText: "Cancelar",
    //                 width: "46rem",
    //             });

    //             break;

    //         case "close":
    //             Swal.close();

    //             break;

    //         case "confirm":
    //             return new Promise((result, reject) => {
    //                 Swal.fire({
    //                     title: 'Estas seguro?',
    //                     text: text,
    //                     icon: 'warning',
    //                     showCancelButton: true,
    //                     confirmButtonColor: '#3085d6',
    //                     cancelButtonColor: '#d33',
    //                     confirmButtonText: 'Si,continuar'
    //                 }).then((result) => {
    //                     if (result.isConfirmed) {
    //                         Swal.fire(
    //                             'Éxito!',
    //                             'Se ha procedido con la solicitud',
    //                             'success'
    //                         )
    //                     }
    //                 });
    //             });

    //             break;
    //     }
    // }

};