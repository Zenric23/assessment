import { useState } from "react"


const useModal = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [openModal, setOpenModal] = useState(false)

    const toogleModal = () => {
        setOpenModal(!openModal)
    }

    const closeModal = () => {
        setOpenModal(false)
    }

    return {
            isLoading,
            setIsLoading,
            openModal,
            setOpenModal,
            toogleModal,
            closeModal
        }
}

export default useModal