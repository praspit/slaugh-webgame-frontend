const TimeSlider = ({value,onTypeChange}) => {
    return (
        <>
            <h2>Time per Turn : {value} s</h2>
                <input
                    type="range"
                    className='slider'
                    min={5}
                    max={60}
                    step={5}
                    value={value}
                    onChange={onTypeChange}
                />
        </>
    )
}

export default TimeSlider