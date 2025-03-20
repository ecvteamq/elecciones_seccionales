export class Validaciones {
    //Validacion para mostrar la etiqueta que contiene el mensaje
    validErrorForm(campo, myForm) {
        return myForm.get(campo).errors && myForm.get(campo).dirty;
    }

    //Validacion para mostrar el tipo de mensaje
    validTypeMsgForm(nombre, campo, myForm) {
        let iCampo = myForm.get(campo);
        if (iCampo.hasError('required'))
            return 'El campo ' + nombre + ' es requerido';
        if (iCampo.hasError('pattern'))
            return nombre + " Incorrecto";
        if (iCampo.hasError('email'))
            return nombre + " Incorrecto";
        if (iCampo.hasError('minlength')) {
            return nombre + " requiere minimo" + " " + iCampo.errors.minlength.requiredLength + " caracteres";
        }
        if (iCampo.hasError('maxlength')) {
            return nombre + " requiere máximo" + " " + iCampo.errors.maxlength.requiredLength + " caracteres";
        }
        return "";
    }
    validErrorForm1(campo, myForm1) {
        return myForm1.get(campo).errors && myForm1.get(campo).dirty;
    }

    //Validacion para mostrar el tipo de mensaje
    // validTypeMsgFormType(nombre, campo, myForm1) {
    //     let iCampo = myForm1.get(campo);
    //     if (iCampo.hasError('required'))
    //         return 'El campo '+nombre+' es requerido';
    //     if (iCampo.hasError('pattern'))
    //         return nombre + " Incorrecto" ;
    //     if (iCampo.hasError('email'))
    //         return nombre + " Incorrecto";
    //     if (iCampo.hasError('minlength')) {
    //         return nombre + " requiere minimo"  + " " + iCampo.errors.minlength.requiredLength + " caracteres";
    //     }
    //     if (iCampo.hasError('maxlength')) {
    //         return nombre + " requiere máximo" + " " + iCampo.errors.maxlength.requiredLength + " caracteres";
    //     }
    // }

    public soloNumeros(e) {
        var key = window.event ? e.which : e.keyCode;
        if (key < 46 || key > 57) {
            e.preventDefault();
        }
    }
}