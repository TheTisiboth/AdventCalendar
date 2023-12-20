// eslint-disable-next-line import/named
import { Checkbox, FormControlLabel, FormControlLabelProps } from "@mui/material"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"

type IFormCheckboxProps = {
    name: string
} & Omit<FormControlLabelProps, "control">

const FormCheckbox: FC<IFormCheckboxProps> = ({ name, ...otherProps }) => {
    const { control } = useFormContext()
    return (
        <FormControlLabel
            {...otherProps}
            control={<Controller name={name} control={control} render={({ field }) => <Checkbox {...field} />} />}
        />
    )
}

export default FormCheckbox
