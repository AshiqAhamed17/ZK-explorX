// Prove a private value lies within a public [min, max] range, without
// revealing the value itself. The classic "prove you're old enough without
// revealing your exact age" pattern — generalized to a two-sided range check
// so it's usable for more than just age.
//
// `value` is private (the default for Noir's main arguments); `min`/`max`
// are public and become the on-chain-visible public inputs when this circuit
// is proven and verified.
fn main(value: u64, min: pub u64, max: pub u64) {
    assert(value >= min);
    assert(value <= max);
}

#[test]
fn test_value_within_range_passes() {
    main(25, 18, 120);
}

#[test]
fn test_value_at_lower_bound_passes() {
    main(18, 18, 120);
}

#[test]
fn test_value_at_upper_bound_passes() {
    main(120, 18, 120);
}

#[test(should_fail)]
fn test_value_below_range_fails() {
    main(17, 18, 120);
}

#[test(should_fail)]
fn test_value_above_range_fails() {
    main(121, 18, 120);
}
