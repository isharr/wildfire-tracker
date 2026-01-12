import { icon } from "@iconify/react"


const LocationMarker = ({}) => {

    return(<div className="location-marker" onclick={onClick}>
        <Icon icon = {locationIcon} className = "location-icon"/>
    </div>)
}

export default LocationMarker