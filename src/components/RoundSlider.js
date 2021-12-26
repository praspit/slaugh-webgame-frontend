const RoundSlider = ({value,onTypeChange}) => {
    return (
        <>
            <h2>Number of Rounds : {value}</h2>
                <input
                    type="range"
                    className='slider'
                    min={1}
                    max={10}
                    step={1}
                    value={value}
                    onChange={onTypeChange}
                />
        </>
    )
}

export default RoundSlider