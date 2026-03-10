fn main(
    bid: Field,
    secret: Field,
    commitment: pub Field,
) {
    
    let computed = bid + secret;
    assert(computed != 0, "Invalid inputs");
    assert(commitment != 0, "Invalid commitment");
}